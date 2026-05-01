# MediFollow Distributed Kubernetes SOP (Master + Workers)

This document explains what we built, why we built it, and the exact commands to run for both:
- Master owner (control-plane host)
- Teammates (worker nodes)

## What is the use of this setup?

We are implementing a real kubeadm distributed architecture (closer to industry practice):
- One shared control-plane (master) managed by the team owner
- Multiple worker nodes managed by teammates
- Private connectivity through Tailscale so members can join from different networks

This lets the team:
- Deploy backend/frontend on Kubernetes
- Validate distributed behavior (node join, scheduling, service networking)
- Demonstrate realistic CI/CD + Kubernetes workflow for evaluation

## What is already installed/provisioned?

### Master VM (`DevOPs/Vagrantfile`)
- Docker + containerd
- kubeadm, kubelet, kubectl
- Kernel/sysctl prerequisites
- Swap disabled in provisioning (must still verify during manual operations)
- Kubernetes control-plane init commands (manual step run by master owner)
- Existing forwarded ports for Jenkins/Sonar/Nexus/app access

### Worker VM (`DevOPs/worker/Vagrantfile`)
- Docker + containerd
- kubeadm, kubelet, kubectl
- Tailscale package
- Kernel/sysctl prerequisites
- Kubelet node IP configuration support
- Ready for `kubeadm join` from master-generated token

---

## Part 1 - Master Owner Full Runbook

### A) Start and enter master VM

```bash
cd DevOPs
vagrant up default
vagrant ssh default
```

### B) Ensure Tailscale is installed and connected

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale ip -4
```

Save this IP (example: `100.x.x.x`). This is the API endpoint workers use to join.

### C) Rebuild control-plane cleanly (if required)

```bash
sudo swapoff -a
sudo sed -i '/\/swap.img/s/^/#/' /etc/fstab
cat /proc/swaps
```

`cat /proc/swaps` should show no active swap entries.

```bash
MASTER_TS_IP=$(tailscale ip -4)
sudo kubeadm reset -f
sudo rm -rf /etc/cni/net.d /var/lib/etcd
echo "KUBELET_EXTRA_ARGS=--node-ip=${MASTER_TS_IP}" | sudo tee /etc/default/kubelet
sudo systemctl daemon-reload
sudo systemctl restart containerd
sudo systemctl restart kubelet
sudo kubeadm init --apiserver-advertise-address=$MASTER_TS_IP --pod-network-cidr=10.244.0.0/16 --cri-socket unix:///run/containerd/containerd.sock
```

### D) Configure kubectl + CNI

```bash
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

### E) Validate master health

```bash
kubectl get pods -n kube-flannel -w
```

When flannel is `Running`, stop watch (`Ctrl+C`) and run:

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

Expected: master node `Ready`, system pods `Running`.

### F) Generate worker join command

```bash
kubeadm token create --print-join-command
```

Share the full output line to teammates.

### G) Start SonarQube services before CI/CD tests

```bash
# 1) Start DB first
sudo docker start sonarqube-db

# 2) Then start SonarQube
sudo docker start sonarqube

# 3) Verify both are up
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

curl http://localhost:9000/api/system/status
```

---

## Part 2 - Worker Node Full Runbook (Teammates)

### A) Start and enter worker VM

```bash
cd DevOPs/worker
vagrant up
vagrant ssh
```

### B) Connect worker to Tailscale

```bash
sudo tailscale up
TS_IP=$(tailscale ip -4)
echo $TS_IP
```

### C) Configure kubelet node IP and restart

```bash
echo "KUBELET_EXTRA_ARGS=--node-ip=${TS_IP}" | sudo tee /etc/default/kubelet
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

### D) Join cluster using master token command

Master owner sends:

```bash
sudo kubeadm join <MASTER_TAILSCALE_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>
```

Worker teammate runs exactly that command.

### E) Worker-side verification

```bash
sudo systemctl status kubelet --no-pager
```

Then ask master owner to verify node from control-plane.

---

## Part 3 - Token lifecycle and failure behavior

- Join token expires (default around 24h)
- If join fails with token/cert errors, master should regenerate:

```bash
kubeadm token create --print-join-command
```

- If worker partially joined and needs reset:

```bash
sudo kubeadm reset -f
sudo systemctl restart kubelet
```

Then run a fresh join command from master.

---

## Part 4 - Demo commands (for professor)

### Master demo

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

### Optional scheduling proof

```bash
kubectl create deployment demo-nginx --image=nginx
kubectl get pods -o wide
```

---

## Part 5 - Daily start/stop operations

### Master owner

```bash
cd DevOPs
vagrant up default
vagrant ssh default
kubectl get nodes -o wide
```

Stop:

```bash
vagrant halt default
```

### Worker teammate

```bash
cd DevOPs/worker
vagrant up
vagrant ssh
```

Stop:

```bash
vagrant halt
```

---

## Part 6 - Quick troubleshooting

- `kubelet not running` + swap message:
  - disable swap (`swapoff -a` and comment `/swap.img` in `/etc/fstab`)
- `node NotReady` after fresh setup:
  - wait for flannel daemonset to become `Running`
- `join failed token expired`:
  - regenerate join command on master
- `cannot reach master:6443`:
  - ensure both nodes are connected to Tailscale and use Tailscale IPs
