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

**Multi-PC (Tailscale) rule:** Do **not** join from another PC using `192.168.33.10` — that address exists only on the master’s VirtualBox host. Remote workers need the master’s **`100.x` Tailscale IP** in `kubeadm join`, which means the control-plane must be initialized with `--apiserver-advertise-address=$(tailscale ip -4)` (see **C**). If you already inited the cluster on `192.168.33.10`, run **C** once to reset and re-init on the Tailscale IP, then share a **new** join command.

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
sudo kubeadm init --apiserver-advertise-address=$MASTER_TS_IP --pod-network-cidr=10.244.0.0/16 --cri-socket unix:///run/containerd/containerd.sock --ignore-preflight-errors=NumCPU,Mem
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

### G) SonarQube (Postgres + server) — first time vs daily start

Sonar runs in Docker on the **master** VM; port **9000** is forwarded to Windows at `http://localhost:9000`. The backend CI pipeline in [`DevOPs/Jenkinsfile-back-ci`](../Jenkinsfile-back-ci) uses `http://localhost:9000` and a Jenkins credential id **`sonar-token`** (see [section H](#h-jenkins--sonarqube-backend-ci)).

#### First-time: create volumes and containers (once per fresh VM or wiped Docker volume)

On the master (after `vagrant ssh`):

```bash
sudo bash /vagrant/setup-sonarqube.sh
```

If **`set: invalid option`** appears, the helper script picked up Windows **CRLF** line endings via the synced folder — fix once, then rerun:

```bash
sed -i 's/\r$//' /vagrant/setup-sonarqube.sh
sudo bash /vagrant/setup-sonarqube.sh
```

Or manually:

```bash
sudo docker compose -f /vagrant/docker-compose.sonarqube.yml pull
sudo docker compose -f /vagrant/docker-compose.sonarqube.yml up -d
```

Wait several minutes (**Elasticsearch + DB migrations** — **5–15 minutes** on a VM is normal). Prefer a soft probe so you don't abort while Sonar binds:

```bash
# repeat until HTTP 200 (or use setup script, which polls for you)
until curl -sf http://localhost:9000/api/system/status; do sleep 15; echo "still starting..."; done
sudo docker logs sonarqube 2>&1 | tail -120
```

**First Sonar login (user `admin`):** Sonar prints a temporary admin password in `docker logs sonarqube` on first bootstrap—search the log output for password / Administrator. Finish the browser wizard and choose a permanent admin password.

Dev-only Postgres password in Compose defaults to **`sonar_local_dev_only`**; set env **`SONAR_DB_PASSWORD`** on `docker compose` if you override it (`SONAR_DB_PASSWORD=... docker compose … up -d`).

#### Daily: containers already exist

```bash
sudo docker start sonarqube-db
sleep 5
sudo docker start sonarqube
```

Equivalent:

```bash
sudo docker compose -f /vagrant/docker-compose.sonarqube.yml start
```

Verify:

```bash
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

curl -sf http://localhost:9000/api/system/status
```

If you see **`No such container: sonarqube-db`**, run the **First-time** block above.

### H) Jenkins + SonarQube (backend CI)

Do this once in Jenkins so pipelines that reference [`Jenkinsfile-back-ci`](../Jenkinsfile-back-ci) can run the Sonar stage:

1. Confirm Sonar is up: `curl http://localhost:9000/api/system/status` on the master.
2. In Sonar: **My Account → Security → Generate Tokens** — create a token (e.g. name `jenkins`).
3. Jenkins: **Manage Jenkins → Credentials → Global** — **Add Secret text** with ID **`sonar-token`** (must match exactly) and paste the Sonar token.
4. Jenkins runs **`docker run`** for `sonarsource/sonar-scanner-cli`; the **`jenkins`** user must access Docker (`sudo su - jenkins -c 'docker ps'`). If permission denied: `sudo usermod -aG docker jenkins` and `sudo systemctl restart jenkins`.
5. Project key **`MediFollow-Backend`** is created automatically on the first successful scan (**`-Dsonar.projectKey=MediFollow-Backend`** in the Jenkinsfile).

No Sonar Jenkins plugin is required for that pipeline—it uses the Sonar Scanner Docker image.

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
- **`No such container: sonarqube-db`** / Sonar unreachable from Jenkins:
  - on the master, run **`sudo bash /vagrant/setup-sonarqube.sh`** (first-time bootstrap), then [section G](#g-sonarqube-postgres--server--first-time-vs-daily-start) daily **`docker start`**
- **`setup-sonarqube.sh`**: `set: invalid option` → strip CRLF (**`sed -i 's/\r$//' /vagrant/setup-sonarqube.sh`**) — repository uses **`.gitattributes`** `*.sh eol=lf`; keep Git checkout normalized.
- **`curl` Connection reset / empty reply** against port 9000:
  - usually **startup not finished yet** — wait and retry **`curl -sf`**; watch **`sudo docker logs -f sonarqube`**. Only if Elasticsearch bootstrap errors persist after 15+ minutes, check **`vm.max_map_count=262144`** on the VM host (**`sysctl vm.max_map_count`**).
- **Jenkins: `npm: not found` / exit 127 on Front-CI**: not a plugin CVE — **Node/npm is missing on the master VM.** Install from the repo’s updated **`DevOPs/Vagrantfile`** with **`sudo vagrant provision`** from **`DevOPs`**, **or** on the VM: **`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash && sudo apt-get install -y nodejs`** then rerun the pipeline. Updating plugins is still recommended separately for the security banner.
