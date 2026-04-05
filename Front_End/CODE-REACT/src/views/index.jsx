import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, ProgressBar, Button, Badge, Table, Dropdown, ListGroup } from "react-bootstrap";
import Card from "../components/Card";
import ReactApexChart from 'react-apexcharts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Scrollbar from "smooth-scrollbar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doctorApi, appointmentApi, patientApi, departmentApi, healthLogApi } from "../services/api";
import Chart from 'react-apexcharts';
import SecureMessagingHubCard from "../components/SecureMessagingHubCard";

const generatePath = (path) => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "";
    const p = (path || "").replace(/^\/+/, "");
    const url = `${window.origin}${base}/${p}`;
    return url.replace(/([^:])\/\/+/g, "$1/");
};

const DEFAULT_AVATAR = generatePath("assets/images/user/11.png");

function formatApptDate(iso) {
    const p = (iso || "").split("T")[0];
    const [y, m, d] = p.split("-");
    if (!y || !m || !d) return p || "—";
    return `${d}/${m}/${y}`;
}

function agendaPatientName(row) {
    const p = row.patientId;
    if (p && typeof p === "object") {
        return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || "—";
    }
    return "—";
}

function agendaPatientPhone(row) {
    const p = row.patientId;
    if (p && typeof p === "object" && p.phone) return p.phone;
    return "—";
}

function getLast6YearMonths() {
    const out = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
        const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
        out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`);
    }
    return out;
}

function monthShort(ym) {
    const [y, m] = String(ym || "").split("-");
    if (!y || !m) return ym;
    return `${m}/${y.slice(2)}`;
}

function patientRowName(p) {
    if (!p) return "—";
    const n = `${p.firstName || ""} ${p.lastName || ""}`.trim();
    return n || p.email || "—";
}

const getDoctorImage = (doctor) => {
    if (!doctor?.profileImage) return DEFAULT_AVATAR;
    const img = doctor.profileImage;
    if (img?.startsWith("data:")) return img;
    if (img?.startsWith("http")) return img;
    const path = img.startsWith("/") ? img.slice(1) : img;
    return path ? generatePath(path) : DEFAULT_AVATAR;
};

const Index = () => {
    const { t, i18n } = useTranslation();
    const backgroundImage = generatePath("/assets/images/page-img/38.png");
    const [doctorUser, setDoctorUser] = useState(() => {
        try {
            const stored = localStorage.getItem("doctorUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        const onDoctorUpdated = () => {
            try {
                const stored = localStorage.getItem("doctorUser");
                setDoctorUser(stored ? JSON.parse(stored) : null);
            } catch { setDoctorUser(null); }
        };
        window.addEventListener("doctor-updated", onDoctorUpdated);
        return () => window.removeEventListener("doctor-updated", onDoctorUpdated);
    }, []);

    const [doctorAgenda, setDoctorAgenda] = useState([]);
    const [myPatients, setMyPatients] = useState([]);
    const [pendingEscalations, setPendingEscalations] = useState([]);
    const [colleagueDoctors, setColleagueDoctors] = useState([]);
    const [deptNurses, setDeptNurses] = useState([]);
    const [monthlyApptSeries, setMonthlyApptSeries] = useState({ months: [], counts: [] });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem("doctorUser");
        const doctorId = stored ? (JSON.parse(stored)?.id) : null;
        if (doctorId) {
            doctorApi.getById(doctorId)
                .then((doctor) => setDoctorUser((prev) => ({ ...prev, ...doctor, id: doctor._id || doctor.id })))
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!doctorUser?.id) {
            setDoctorAgenda([]);
            return;
        }
        let cancelled = false;
        appointmentApi
            .getUpcomingForDoctor()
            .then((rows) => {
                if (!cancelled) setDoctorAgenda(Array.isArray(rows) ? rows : []);
            })
            .catch(() => {
                if (!cancelled) setDoctorAgenda([]);
            });
        return () => {
            cancelled = true;
        };
    }, [doctorUser?.id]);

    useEffect(() => {
        if (!doctorUser?.id) {
            setMyPatients([]);
            setPendingEscalations([]);
            setColleagueDoctors([]);
            setDeptNurses([]);
            setMonthlyApptSeries({ months: [], counts: [] });
            return;
        }
        let cancelled = false;
        const months = getLast6YearMonths();
        (async () => {
            try {
                const [patients, escalations, deptDoc, deptNur, monthRows] = await Promise.all([
                    patientApi.getMyAssignedForDoctor().catch(() => []),
                    healthLogApi.doctorNurseEscalations("pending").catch(() => []),
                    departmentApi.getMyDoctorsAsDoctor().catch(() => ({})),
                    departmentApi.getMyNursesAsDoctor().catch(() => ({})),
                    Promise.all(months.map((ym) => appointmentApi.getConfirmedForDoctorMonth(ym).catch(() => []))),
                ]);
                if (cancelled) return;
                const counts = monthRows.map((r) => (Array.isArray(r) ? r.length : 0));
                setMyPatients(Array.isArray(patients) ? patients : []);
                setPendingEscalations(Array.isArray(escalations) ? escalations : []);
                setColleagueDoctors(Array.isArray(deptDoc?.doctors) ? deptDoc.doctors : []);
                setDeptNurses(Array.isArray(deptNur?.nurses) ? deptNur.nurses : []);
                setMonthlyApptSeries({ months, counts });
            } catch {
                if (!cancelled) {
                    setMyPatients([]);
                    setPendingEscalations([]);
                    setColleagueDoctors([]);
                    setDeptNurses([]);
                    setMonthlyApptSeries({ months: [], counts: [] });
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [doctorUser?.id]);

    const isDoctor = !!doctorUser;

    const apptCalendarEnableDates = useMemo(() => {
        const set = new Set();
        for (const row of doctorAgenda) {
            const d = row.date;
            if (d) set.add(String(d).split("T")[0]);
        }
        return Array.from(set);
    }, [doctorAgenda]);

    const [wavechart7, setWavechart7] = useState({
        chart: {
            height: 80,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000,
                },
            },
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: true,
            },
            group: 'sparklines',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0,
            },
        },
        series: [
            {
                name: 'Appointments',
                data: generateSampleData1(),
            },
        ],
        colors: ['#089bab'],
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            },
        },
        yaxis: {
            max: 130,
            labels: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
    });

    useEffect(() => {
        if (doctorUser) return undefined;
        const interval = setInterval(() => {
            updateChart1();
        }, 2000);

        return () => clearInterval(interval);
    }, [doctorUser]);

    function generateSampleData1() {
        const data = [];
        const initialData = [30, 60, 65, 40, 20, 50, 80, 10, 100];
        let time = new Date().getTime() - 777600000;

        initialData.forEach((value) => {
            data.push({
                x: time,
                y: value,
            });
            time += 86400000;
        });

        return data;
    }

    const updateChart1 = () => {
        setWavechart7((prevChart) => {
            const newSeries = [...prevChart.series[0].data];
            const lastDataPoint = newSeries[newSeries.length - 1];

            newSeries.shift();
            newSeries.push({
                x: lastDataPoint.x + 86400000,
                y: Math.floor(Math.random() * 130),
            });

            return {
                ...prevChart,
                series: [
                    {
                        ...prevChart.series[0],
                        data: newSeries,
                    },
                ],
            };
        });
    };

    const [wavechart8, setWavechart8] = useState({
        chart: {
            height: 80,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000,
                },
            },
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: true,
            },
            group: 'sparklines',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0,
            },
        },
        series: [
            {
                name: 'New Patients',
                data: generateSampleData(),
            },
        ],
        colors: ['#fc9f5b'],
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            },
        },
        yaxis: {
            max: 130,
            labels: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
    });

    useEffect(() => {
        if (doctorUser) return undefined;
        const interval = setInterval(() => {
            updateChart();
        }, 2000);

        return () => clearInterval(interval);
    }, [doctorUser]);

    function generateSampleData() {
        const data = [];
        const initialData = [30, 60, 65, 40, 20, 50, 80, 10, 100];
        let time = new Date().getTime() - 777600000;

        initialData.forEach((value) => {
            data.push({
                x: time,
                y: value,
            });
            time += 86400000;
        });

        return data;
    }

    const updateChart = () => {
        setWavechart8((prevChart) => {
            const newSeries = [...prevChart.series[0].data];
            const lastDataPoint = newSeries[newSeries.length - 1];

            newSeries.shift();
            newSeries.push({
                x: lastDataPoint.x + 86400000,
                y: Math.floor(Math.random() * 130),
            });

            return {
                ...prevChart,
                series: [
                    {
                        ...prevChart.series[0],
                        data: newSeries,
                    },
                ],
            };
        });
    };


    // HealthCare Chart
    const [chartOptions] = useState({
        series: [
            {
                name: 'Series1',
                data: [31, 40, 28, 51, 42, 109, 100],
            },
        ],
        chart: {
            height: 340,
            type: 'area',
            rtl: true, // Enabling RTL for the chart
        },
        colors: ['#089bab'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            type: 'datetime',
            categories: [
                '2018-09-19T00:00:00.000Z',
                '2018-09-19T01:30:00.000Z',
                '2018-09-19T02:30:00.000Z',
                '2018-09-19T03:30:00.000Z',
                '2018-09-19T04:30:00.000Z',
                '2018-09-19T05:30:00.000Z',
                '2018-09-19T06:30:00.000Z',
            ],
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm',
            },
        },
    });

    const healthCurveChartForDoctor = useMemo(() => {
        if (!isDoctor || monthlyApptSeries.months.length === 0) return null;
        const cats = monthlyApptSeries.months.map(monthShort);
        return {
            ...chartOptions,
            series: [{ name: t("doctorHome.chartSeries"), data: monthlyApptSeries.counts }],
            xaxis: {
                type: "category",
                categories: cats,
            },
        };
    }, [isDoctor, monthlyApptSeries, chartOptions, t]);

    const doctorSparkAppointment = useMemo(() => {
        if (!isDoctor || monthlyApptSeries.months.length === 0) return null;
        const data = monthlyApptSeries.counts.map((y, i) => ({
            x: new Date(`${monthlyApptSeries.months[i]}-02T12:00:00`).getTime(),
            y,
        }));
        return {
            ...wavechart7,
            series: [{ name: t("doctorHome.sparkAppt"), data }],
        };
    }, [isDoctor, monthlyApptSeries, wavechart7, t]);

    const pieForDoctor = useMemo(() => {
        if (!isDoctor || monthlyApptSeries.counts.length < 2) return null;
        const c = monthlyApptSeries.counts;
        const last = c[c.length - 1] || 0;
        const prev = c[c.length - 2] || 0;
        if (last + prev === 0) return null;
        return {
            options: {
                chart: { type: "donut", fontFamily: "inherit" },
                labels: [t("doctorHome.pieThisMonth"), t("doctorHome.pieLastMonth")],
                colors: ["#089bab", "#faa264"],
                legend: { position: "bottom" },
                plotOptions: {
                    pie: {
                        donut: { size: "65%" },
                    },
                },
            },
            series: [last, prev],
        };
    }, [isDoctor, monthlyApptSeries, t]);

    // Patient Overview chart (demo only — médecin : graphique React Apex ci-dessous)
    useEffect(() => {
        if (doctorUser) return undefined;
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        const chart = am4core.create('home-chart-03', am4charts.PieChart);
        chart.hiddenState.properties.opacity = 0;

        // Chart data
        chart.data = [
            { country: 'USA', value: 401 },
            { country: 'India', value: 300 },
            { country: 'Australia', value: 200 },
            { country: 'Brazil', value: 100 }
        ];

        // Chart properties
        chart.rtl = true;
        chart.radius = am4core.percent(70);
        chart.innerRadius = am4core.percent(40);
        chart.startAngle = 180;
        chart.endAngle = 360;

        // Create series
        const series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = 'value';
        series.dataFields.category = 'country';
        series.colors.list = [
            am4core.color('#089bab'),
            am4core.color('#2ca5b2'),
            am4core.color('#faa264'),
            am4core.color('#fcb07a')
        ];

        // Configure slices
        series.slices.template.cornerRadius = 0;
        series.slices.template.innerCornerRadius = 0;
        series.slices.template.draggable = true;
        series.slices.template.inert = true;
        series.alignLabels = false;

        series.hiddenState.properties.startAngle = 90;
        series.hiddenState.properties.endAngle = 90;

        // Add legend
        chart.legend = new am4charts.Legend();
        // chart.logo.disabled = true;

        return () => {
            chart.dispose();
        };
    }, [doctorUser]);


    const patientProgress = [
        { name: 'Bud Jet', progress: 30, badgeColor: 'badge-primary', mb: 3 },
        { name: 'Barney Cull', progress: 70, badgeColor: 'badge-success', mb: 3 },
        { name: 'Eric Shun', progress: 15, badgeColor: 'badge-danger', mb: 3 },
        { name: 'Rick Shaw', progress: 55, badgeColor: 'badge-warning', mb: 3 },
        { name: 'Ben Effit', progress: 45, badgeColor: 'badge-info', mb: 3 },
        { name: 'Rick Shaw', progress: 55, badgeColor: 'badge-warning', mb: 3 },
        { name: 'Marge Arita', progress: 65, badgeColor: 'badge-primary', mb: 3 },
        { name: 'Barry Cudat', progress: 15, badgeColor: 'badge-danger', mb: 0 },
    ];

    const countryVisits = [
        { country: 'United States', progress: 95, progressColor: 'primary', mt: 0 },
        { country: 'India', progress: 75, progressColor: 'warning', mt: 4 },
        { country: 'Australia', progress: 55, progressColor: 'success', mt: 4 },
        { country: 'Brazil', progress: 25, progressColor: 'danger', mt: 4 },
    ];

    const appointmentsData = [
        { patient: 'Petey Cruiser', doctor: 'Dr. Monty Carlo', date: '20/02/2020', time: '8:00 AM', contact: '+1-202-555-0146' },
        { patient: 'Anna Sthesia', doctor: 'Dr. Pete Sariya', date: '25/02/2020', time: '8:30 AM', contact: '+1-202-555-0164' },
        { patient: 'Paul Molive', doctor: 'Dr. Brock Lee', date: '25/02/2020', time: '9:45 AM', contact: '+1-202-555-0153' },
        { patient: 'Anna Mull', doctor: 'Dr. Barb Ackue', date: '27/02/2020', time: '11:30 AM', contact: '+1-202-555-0154' },
        { patient: 'Paige Turner', doctor: 'Dr. Walter Melon', date: '28/02/2020', time: '3:30 PM', contact: '+1-202-555-0101' },
        { patient: 'Don Stairs', doctor: 'Dr. Arty Ficial', date: '28/02/2020', time: '4:30 PM', contact: '+1-202-555-0176' },
        { patient: 'Pat Agonia', doctor: 'Dr. Barb Ackue', date: '29/02/2020', time: '5:00 PM', contact: '+1-202-555-0194' },
    ];

    const doctorsData = [
        { name: 'Dr. Paul Molive', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/01.jpg' },
        { name: 'Dr. Barb Dwyer', qualifications: 'MD', imgSrc: '/assets/images/user/02.jpg' },
        { name: 'Dr. Terry Aki', qualifications: 'MBBS', imgSrc: '/assets/images/user/03.jpg' },
        { name: 'Dr. Robin Banks', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/04.jpg' },
        { name: 'Dr. Barry Wine', qualifications: 'BAMS', imgSrc: '/assets/images/user/05.jpg' },
        { name: 'Dr. Zack Lee', qualifications: 'MS, MD', imgSrc: '/assets/images/user/06.jpg' },
        { name: 'Dr. Otto Matic', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/07.jpg' },
        { name: 'Dr. Tilly Loo', qualifications: 'MD', imgSrc: '/assets/images/user/08.jpg' },
    ];

    // Wave Chart


    useEffect(() => {
        const scrollbarElement = document.querySelector('.my-scrollbar');

        if (scrollbarElement) {
            Scrollbar.init(scrollbarElement);
        }

        return () => {
            // Cleanup the scrollbar instance
            if (scrollbarElement) {
                Scrollbar.destroy(scrollbarElement);
            }
        };
    }, []);

    useEffect(() => {
        if (doctorUser) return undefined;
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress < 70) {
                    return prevProgress + 5;
                }
                clearInterval(interval);
                return 70;
            });
        }, 5);

        return () => clearInterval(interval);
    }, [doctorUser]);

    // Set height to be proportional to progress with a max height of 70px
    const dynamicHeight = (progress / 70) * 70; // Max height of 70px

    const wavePrimary = isDoctor && doctorSparkAppointment ? doctorSparkAppointment : wavechart7;
    const healthCurveActive = healthCurveChartForDoctor || chartOptions;
    const lastMonthApptCount =
        monthlyApptSeries.counts.length > 0 ? monthlyApptSeries.counts[monthlyApptSeries.counts.length - 1] : 0;
    const colleaguesFiltered = useMemo(
        () =>
            colleagueDoctors.filter(
                (d) => String(d._id || d.id) !== String(doctorUser?.id || ""),
            ),
        [colleagueDoctors, doctorUser?.id],
    );

    return (
        <>
            <Row className="mb-3">
                <Col sm={12}>
                    <SecureMessagingHubCard variant="doctor" />
                </Col>
            </Row>
            <Row className="g-3 mb-4">
                <Col sm={12}>
                    <Row className="g-3">
                        {doctorUser ? (
                            <>
                                <Col md={6} lg={3}>
                                    <Card className="bg-primary-subtle border-0 shadow-sm h-100">
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rounded-circle card-icon bg-primary">
                                                    <i className="ri-user-heart-line text-white" aria-hidden />
                                                </div>
                                                <div className="text-end">
                                                    <h2 className="mb-0 text-primary">{myPatients.length}</h2>
                                                    <h6 className="text-primary mb-0 mt-1">{t("doctorHome.kpiPatients")}</h6>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card className="bg-info-subtle border-0 shadow-sm h-100">
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rounded-circle card-icon bg-info">
                                                    <i className="ri-calendar-check-line text-white" aria-hidden />
                                                </div>
                                                <div className="text-end">
                                                    <h2 className="mb-0 text-info">{doctorAgenda.length}</h2>
                                                    <h6 className="text-info mb-0 mt-1">{t("doctorHome.kpiAppointments")}</h6>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card className="bg-warning-subtle border-0 shadow-sm h-100">
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rounded-circle card-icon bg-warning">
                                                    <i className="ri-alarm-warning-line text-white" aria-hidden />
                                                </div>
                                                <div className="text-end">
                                                    <h2 className="mb-0 text-warning">{pendingEscalations.length}</h2>
                                                    <h6 className="text-warning mb-0 mt-1">{t("doctorHome.kpiEscalations")}</h6>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card className="bg-success-subtle border-0 shadow-sm h-100">
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="rounded-circle card-icon bg-success">
                                                    <i className="ri-nurse-line text-white" aria-hidden />
                                                </div>
                                                <div className="text-end">
                                                    <h2 className="mb-0 text-success">{deptNurses.length}</h2>
                                                    <h6 className="text-success mb-0 mt-1">{t("doctorHome.kpiNurses")}</h6>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </>
                        ) : (
                            <>
                                <Col md={6} lg={3}>
                                    <Card>
                                        <Card.Body>
                                            <div className="progress-bar-vertical bg-primary-subtle">
                                                <ProgressBar
                                                    variant="primary"
                                                    now={70}
                                                    className="custom-progress-bar bg-primary"
                                                    style={{ height: `${dynamicHeight}%`, transition: "height 0.5s ease-in-out" }}
                                                    aria-valuemin={0}
                                                    aria-valuenow={70}
                                                    role="progressbar"
                                                    max={70}
                                                />
                                            </div>
                                            <span className="d-block line-height-4">10 Feb, 2020</span>
                                            <h4 className="mb-2 mt-2">Hypertensive Crisis</h4>
                                            <p className="mb-0 line-height">Ongoing treatment</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card>
                                        <Card.Body>
                                            <div className="progress-bar-vertical bg-danger-subtle">
                                                <ProgressBar
                                                    variant="danger"
                                                    now={70}
                                                    className="custom-progress-bar bg-danger"
                                                    style={{ height: `${dynamicHeight}%`, transition: "height 0.5s ease-in-out" }}
                                                    aria-valuemin={0}
                                                    aria-valuenow={70}
                                                    role="progressbar"
                                                />
                                            </div>
                                            <span className="d-block line-height-4">12 Jan, 2020</span>
                                            <h4 className="mb-2 mt-2">Osteoporosis</h4>
                                            <p className="mb-0 line-height">Incurable</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card>
                                        <Card.Body>
                                            <div className="progress-bar-vertical bg-warning-subtle">
                                                <ProgressBar
                                                    variant="warning"
                                                    now={70}
                                                    className="custom-progress-bar bg-warning"
                                                    style={{ height: `${dynamicHeight}%`, transition: "height 0.5s ease-in-out" }}
                                                    aria-valuemin={0}
                                                    aria-valuenow={70}
                                                    role="progressbar"
                                                />
                                            </div>
                                            <span className="d-block line-height-4">15 Feb, 2020</span>
                                            <h4 className="mb-2 mt-2">Hypertensive Crisis</h4>
                                            <p className="mb-0 line-height">Examination</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={3}>
                                    <Card>
                                        <Card.Body
                                            className="p-0 rounded"
                                            style={{
                                                background: `url(${backgroundImage}) no-repeat center center`,
                                                backgroundSize: "contain",
                                                minHeight: "152px",
                                            }}
                                        />
                                    </Card>
                                </Col>
                            </>
                        )}
                    </Row>
                </Col>
            </Row>

            <Row className="g-4 align-items-stretch">
                {/* User Profile Card */}
                <Col lg={4}>
                    <Card className="user-profile-block">
                        <Card.Body>
                            <div className="user-details-block">
                                <div className="user-profile text-center">
                                    <img
                                        src={getDoctorImage(doctorUser)}
                                        alt="profile-img"
                                        className="rounded-circle img-fluid"
                                        style={{ width: "130px", height: "130px", objectFit: "cover" }}
                                    />
                                </div>
                                <div className="text-center mt-3 pb-3">
                                    <h4><b>{doctorUser ? `Dr. ${doctorUser.firstName || ''} ${doctorUser.lastName || ''}`.trim() || doctorUser.email : 'Doctor'}</b></h4>
                                    <p>{doctorUser?.specialty || 'Doctor'}</p>
                                    <p>{doctorUser?.email || '—'}</p>
                                    <Button variant="primary-subtle" as={Link} to={doctorUser ? `/doctor/doctor-profile/${doctorUser.id}` : '#'}>
                                        {t("nav.viewDoctorProfile")}
                                    </Button>
                                </div>
                                <hr />
                                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 m-0">
                                    <li className="text-center">
                                        <h3 className="counter">{doctorUser ? myPatients.length : 4500}</h3>
                                        <span>{doctorUser ? t("doctorHome.profileStatPatients") : "Operations"}</span>
                                    </li>
                                    <li className="text-center">
                                        <h3 className="counter">{doctorUser ? pendingEscalations.length : "3.9"}</h3>
                                        <span>{doctorUser ? t("doctorHome.profileStatEscalations") : "Medical Rating"}</span>
                                    </li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Health Curve Card */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">
                                    {doctorUser ? t("doctorHome.chartAppointmentsTitle") : "Health Curve"}
                                </h4>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ position: "relative" }}>
                            <div id="wave-chart-8" className="h-100" style={{ height: '340px', minHeight: '355px' }}>
                                <ReactApexChart
                                    options={healthCurveActive}
                                    series={healthCurveActive.series}
                                    type="area"
                                    height={340}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                {/* First Column */}
                <Col lg={4} className="iq-calendar">
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4 className="card-title">
                                {doctorUser ? t("doctorHome.calendarTitle") : "Nearest Treatment"}
                            </h4>
                        </Card.Header>
                        <Card.Body className="course-picker">
                            <Flatpickr
                                key={doctorUser ? apptCalendarEnableDates.join(",") : "demo"}
                                options={{
                                    allowInput: true,
                                    inline: true,
                                    ...(doctorUser && apptCalendarEnableDates.length
                                        ? { enable: apptCalendarEnableDates }
                                        : {}),
                                    ...(i18n.language?.startsWith("fr")
                                        ? { locale: "fr" }
                                        : i18n.language?.startsWith("ar")
                                          ? { locale: "ar" }
                                          : {}),
                                }}
                                className="inline_flatpickr"
                            />
                            <input type="hidden" name="inline" className="d-none inline_flatpickr" value="" />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Second Column */}
                <Col lg={4}>
                    <Card className="no-body">
                        <Card.Body>
                            <h6 className="text-uppercase small text-muted">{t("doctorHome.cardApptsTitle")}</h6>
                            <h3><b>{doctorUser ? lastMonthApptCount : 5075}</b></h3>
                            {doctorUser && (
                                <p className="small text-muted mb-0 mt-2">{t("doctorHome.cardApptsHint")}</p>
                            )}
                        </Card.Body>
                        <div className="wave-chart-container" style={{ height: '80px' }}>
                            <Chart
                                options={doctorUser ? wavePrimary : wavechart7}
                                series={doctorUser ? wavePrimary.series : wavechart7.series}
                                type="area"
                                height={80}
                            />
                        </div>
                    </Card>
                    <Card className="no-body">
                        <Card.Body>
                            <h6 className="text-uppercase small text-muted">{t("doctorHome.cardPatientsTitle")}</h6>
                            <h3><b>{doctorUser ? myPatients.length : 1200}</b></h3>
                            {doctorUser && (
                                <p className="small text-muted mb-0 mt-2">{t("doctorHome.cardPatientsHint")}</p>
                            )}
                        </Card.Body>
                        {doctorUser ? null : (
                            <div className="wave-chart-container" style={{ height: '80px' }}>
                                <Chart options={wavechart8} series={wavechart8.series} type="area" height={80} />
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Third Column */}
                <Col lg={4}>
                    {doctorUser ? (
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <h4 className="card-title">{t("doctorHome.quickLinksTitle")}</h4>
                            </Card.Header>
                            <Card.Body className="d-grid gap-2">
                                <Button as={Link} to="/doctor/my-patients" variant="primary-subtle" className="text-start">
                                    <i className="ri-team-line me-2" aria-hidden />
                                    {t("sidebar.myPatients")}
                                </Button>
                                <Button as={Link} to="/doctor/availability-calendar" variant="primary-subtle" className="text-start">
                                    <i className="ri-calendar-2-line me-2" aria-hidden />
                                    {t("sidebar.appointmentCalendar")}
                                </Button>
                                <Button as={Link} to="/doctor/urgent-nurse-escalations" variant="warning-subtle" className="text-start">
                                    <i className="ri-alarm-warning-line me-2" aria-hidden />
                                    {t("doctorHome.quickEscalations")}
                                </Button>
                                <Button as={Link} to="/chat" variant="info-subtle" className="text-start">
                                    <i className="ri-chat-3-line me-2" aria-hidden />
                                    {t("sidebar.secureMessaging")}
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <h4 className="card-title">Hospital Management</h4>
                            </Card.Header>
                            <Card.Body>
                                <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={20} label="OPD" />
                                    <ProgressBar variant="warning" now={80} label="80%" />
                                </ProgressBar>
                                <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={30} label="Treatment" />
                                    <ProgressBar variant="warning" now={70} label="70%" />
                                </ProgressBar>
                                <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={60} label="Laboratory Test" />
                                    <ProgressBar variant="warning" now={40} label="40%" />
                                </ProgressBar>
                                <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={40} label="New Patient" />
                                    <ProgressBar variant="warning" now={60} label="70%" />
                                </ProgressBar>
                                <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={35} label="Doctors" />
                                    <ProgressBar variant="warning" now={65} label="95%" />
                                </ProgressBar>
                                <ProgressBar style={{ height: '30px' }}>
                                    <ProgressBar variant="primary" now={28} label="Discharge" />
                                    <ProgressBar variant="warning" now={72} label="72%" />
                                </ProgressBar>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
            <Row>
                {/* Patient Progress Section */}
                <Col lg={3}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">
                                    {doctorUser ? t("doctorHome.patientListTitle") : "Patient Progress"}
                                </h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {doctorUser ? (
                                myPatients.length === 0 ? (
                                    <p className="text-muted small mb-0">{t("doctorHome.noPatients")}</p>
                                ) : (
                                    <ul className="list-unstyled mb-0">
                                        {myPatients.slice(0, 10).map((p) => {
                                            const pid = p._id || p.id;
                                            return (
                                                <li
                                                    key={String(pid)}
                                                    className="d-flex align-items-center justify-content-between mb-3"
                                                >
                                                    <Link
                                                        to={`/doctor/my-patients/${encodeURIComponent(String(pid))}`}
                                                        className="text-decoration-none text-dark text-truncate me-2"
                                                    >
                                                        <h6 className="mb-0">{patientRowName(p)}</h6>
                                                    </Link>
                                                    <Badge bg="primary-subtle" text="primary" className="flex-shrink-0">
                                                        {t("doctorHome.badgeFollow")}
                                                    </Badge>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {patientProgress.map((patient, index) => (
                                        <li
                                            key={index}
                                            className={`d-flex align-items-center justify-content-between mb-${patient.mb}`}
                                        >
                                            <div className="media-support-info">
                                                <h6>{patient.name}</h6>{patient.subname}
                                            </div>
                                            <Badge className={`badge ${patient.badgeColor}`}>{patient.progress}%</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4>{doctorUser ? t("doctorHome.pieTitle") : "Patient Overview"}</h4>
                        </Card.Header>
                        <Card.Body>
                            {doctorUser && pieForDoctor ? (
                                <ReactApexChart
                                    options={pieForDoctor.options}
                                    series={pieForDoctor.series}
                                    type="donut"
                                    height={280}
                                />
                            ) : !doctorUser ? (
                                <div id="home-chart-03" className="chart" style={{ height: '280px' }}></div>
                            ) : (
                                <p className="text-muted small mb-0 py-5 text-center">{t("doctorHome.pieEmpty")}</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">
                                    {doctorUser ? t("doctorHome.escalationsTitle") : "Visits From Countries"}
                                </h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {doctorUser ? (
                                pendingEscalations.length === 0 ? (
                                    <p className="text-muted small mb-0">{t("doctorHome.noEscalations")}</p>
                                ) : (
                                    <ul className="list-unstyled mb-0">
                                        {pendingEscalations.slice(0, 6).map((e) => (
                                            <li key={e.id} className="mb-3 pb-2 border-bottom border-light">
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <Link
                                                        to={`/doctor/my-patients/${encodeURIComponent(e.patientId)}`}
                                                        className="fw-semibold text-dark text-decoration-none small"
                                                    >
                                                        {e.patientName}
                                                    </Link>
                                                    <Badge bg="warning" text="dark">
                                                        {e.riskScore != null ? `${e.riskScore}` : "—"}
                                                    </Badge>
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    {e.escalatedByNurseName}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                countryVisits.map((visit, index) => (
                                    <div key={index} className={`details mt-${visit.mt}`}>
                                        <span className="title text-dark">{visit.country}</span>
                                        <div className={`percentage float-end text-${visit.progressColor}`}>
                                            {visit.progress}{" "}
                                            <span>%</span>
                                        </div>
                                        <div className="progress-bar-linear d-inline-block w-100">
                                            <ProgressBar
                                                now={visit.progress}
                                                variant={visit.progressColor}
                                                style={{ height: '6px' }}
                                                className={`shadow-none progress bg-${visit.progressColor}-subtle`}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col lg={8}>
                    <Card>
                        <div className="card-header d-flex justify-content-between iq-new-appoinments">
                            <h4 className="card-title">{doctorUser ? "Rendez-vous confirmés (à venir)" : "New Appointments"}</h4>
                            <Dropdown className="appointments-dropdown rtl-appointments-dropdown">
                                <Dropdown.Toggle variant="link" className="custom-toggle">
                                    <span className="ri-more-fill text-gray"></span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu align="end">
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-fill me-2"></i>View</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-delete-bin-6-fill me-2"></i>Delete</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-pencil-fill me-2"></i>Edit</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-printer-fill me-2"></i>Print</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-file-download-fill me-2"></i>Download</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table className="mb-0 table-borderless">
                                    <thead>
                                        <tr>
                                            <th scope="col">Patient</th>
                                            <th scope="col">{doctorUser ? "Motif" : "Doctor"}</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">{doctorUser ? "Heure" : "Timing"}</th>
                                            <th scope="col">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctorUser ? (
                                            doctorAgenda.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-muted text-center py-4">
                                                        Aucun rendez-vous confirmé à venir. Les demandes validées par l&apos;admin apparaissent ici.
                                                    </td>
                                                </tr>
                                            ) : (
                                                doctorAgenda.map((row) => (
                                                    <tr key={row._id}>
                                                        <td className="fw-semibold">{agendaPatientName(row)}</td>
                                                        <td className="small">{row.title || "—"}</td>
                                                        <td>{formatApptDate(row.date)}</td>
                                                        <td>{row.time || "—"}</td>
                                                        <td className="small">{agendaPatientPhone(row)}</td>
                                                    </tr>
                                                ))
                                            )
                                        ) : (
                                            appointmentsData.map((appointment, index) => (
                                                <tr key={index}>
                                                    <td>{appointment.patient}</td>
                                                    <td>{appointment.doctor}</td>
                                                    <td>{appointment.date}</td>
                                                    <td>{appointment.time}</td>
                                                    <td>{appointment.contact}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h4 className="card-title">
                                {doctorUser ? t("doctorHome.colleaguesTitle") : "Doctors Lists"}
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush" className="my-scrollbar" style={{ height: '277px', outline: 'none' }}>
                                {doctorUser ? (
                                    colleaguesFiltered.length === 0 ? (
                                        <ListGroup.Item className="border-0 text-muted small">
                                            {t("doctorHome.colleaguesEmpty")}
                                        </ListGroup.Item>
                                    ) : (
                                        colleaguesFiltered.map((doc) => {
                                            const did = doc._id || doc.id;
                                            return (
                                                <ListGroup.Item
                                                    key={String(did)}
                                                    className="d-flex justify-content-between align-items-center p-0 mb-4 border-0"
                                                >
                                                    <div className="d-flex align-items-center min-w-0">
                                                        <img
                                                            src={getDoctorImage(doc)}
                                                            alt=""
                                                            className="rounded-circle avatar-40 flex-shrink-0"
                                                        />
                                                        <div className="ms-3 min-w-0">
                                                            <h6 className="mb-0 text-truncate">
                                                                Dr. {`${doc.firstName || ""} ${doc.lastName || ""}`.trim() || doc.email}
                                                            </h6>
                                                            <p className="mb-0 font-size-12 text-muted text-truncate">
                                                                {doc.specialty || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Dropdown className="appointments-dropdown rtl-appointments-dropdown pe-3">
                                                        <Dropdown.Toggle variant="link" id={`dropdown-doc-${did}`} className="custom-toggle">
                                                            <i className="ri-more-2-line text-gray"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu align="end">
                                                            <Dropdown.Item as={Link} to={`/doctor/doctor-profile/${did}`} className="d-flex">
                                                                <i className="ri-eye-line me-2"></i>
                                                                {t("doctorHome.viewProfile")}
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </ListGroup.Item>
                                            );
                                        })
                                    )
                                ) : (
                                    doctorsData.map((doctor, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center p-0 mb-4 border-0">
                                            <div className="d-flex align-items-center">
                                                <img src={generatePath(doctor.imgSrc)} alt="doctor" className="rounded-circle avatar-40" />
                                                <div className="ms-3">
                                                    <h6>{doctor.name}</h6>
                                                    <p className="mb-0 font-size-12">{doctor.qualifications}</p>
                                                </div>
                                            </div>
                                            <Dropdown className="appointments-dropdown rtl-appointments-dropdown pe-3 ">
                                                <Dropdown.Toggle variant="link" id={`dropdown-doctor-${index}`} className="custom-toggle">
                                                    <i className="ri-more-2-line text-gray"></i>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-line me-2"></i>View</Dropdown.Item>
                                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-bookmark-line me-2"></i>Appointment</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                            {doctorUser ? (
                                <Button as={Link} to="/doctor/department-doctors" variant="primary-subtle" className="d-block mt-3">
                                    <i className="ri-team-line me-1" aria-hidden />
                                    {t("doctorHome.viewDepartmentDoctors")}
                                </Button>
                            ) : (
                                <Link to="#" className="btn btn-primary-subtle d-block mt-3">
                                    <i className="ri-add-line"></i> View All Doctors
                                </Link>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Index;
