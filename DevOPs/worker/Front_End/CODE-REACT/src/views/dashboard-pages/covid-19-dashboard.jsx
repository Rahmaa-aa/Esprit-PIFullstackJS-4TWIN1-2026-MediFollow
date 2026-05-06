import React, { useEffect } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// component
import Card from "../../components/Card";

// Am chart Imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

const CovidNineteenDashboard = () => {

    const title = "How to Avoid Virus Infection";
    const tips = [
        {
            image: "/assets/images/page-img/45.png",
            header: "Wash your hands frequently",
            description: "Regularly and thoroughly clean your hands with an alcohol-based hand rub or wash them with soap and water."
        },
        {
            image: "/assets/images/page-img/46.png",
            header: "Maintain social distancing",
            description: "Maintain at least 1 metre (3 feet) distance between yourself and anyone who is coughing or sneezing."
        },
        {
            image: "/assets/images/page-img/47.png",
            header: "Avoid touching eyes, nose and mouth",
            description: "Hands touch many surfaces and can pick up viruses. Once contaminated, hands can transfer the virus to your eyes, nose or mouth. From there, the virus can enter your body and can make you sick."
        },
        {
            image: "/assets/images/page-img/48.png",
            header: "Practice respiratory hygiene",
            description: "Make sure you, and the people around you, follow good respiratory hygiene. This means covering your mouth and nose with your bent elbow or tissue when you cough or sneeze. Then dispose of the used tissue immediately."
        }
    ];

    const backgroundImage = generatePath("/assets/images/page-img/44.png");

    const records = [
        { country: 'China', confirm: '80,967', recover: '972', death: '3,248', flag: '/assets/images/small/china.png' },
        { country: 'France', confirm: '10,995', recover: '245', death: '372', flag: '/assets/images/small/france.png' },
        { country: 'Germany', confirm: '15,320', recover: '242', death: '44', flag: '/assets/images/small/germany.png' },
        { country: 'Iran', confirm: '18,407', recover: '520', death: '1,284', flag: '/assets/images/small/iran.png' },
        { country: 'Italy', confirm: '41,035', recover: '10,600', death: '3,405', flag: '/assets/images/small/italy.png' },
        { country: 'Netherlands', confirm: '2,460', recover: '24', death: '76', flag: '/assets/images/small/netherlands.png' },
        { country: 'Norway', confirm: '789', recover: '135', death: '35', flag: '/assets/images/small/norway.png' },
        { country: 'South Korea', confirm: '1,200', recover: '500', death: '600', flag: '/assets/images/small/south-koria.png' },
        { country: 'Spain', confirm: '18,077', recover: '150', death: '831', flag: '/assets/images/small/spain.png' },
        { country: 'Sweden', confirm: '800', recover: '250', death: '25', flag: '/assets/images/small/sweden.png' },
        { country: 'Switzerland', confirm: '4,222', recover: '125', death: '43', flag: '/assets/images/small/switzerlands.png' },
        { country: 'United States', confirm: '14,354', recover: '150', death: '277', flag: '/assets/images/small/usa.png' },
        { country: 'India', confirm: '197', recover: '50', death: '4', flag: '/assets/images/small/india.png' },
    ];

    const helpLines = [
        { image: '/assets/images/small/china.png', country: 'China' },
        { image: '/assets/images/small/france.png', country: 'France' },
        { image: '/assets/images/small/germany.png', country: 'Germany' },
        { image: '/assets/images/small/iran.png', country: 'Iran' },
        { image: '/assets/images/small/italy.png', country: 'Italy' },
        { image: '/assets/images/small/netherlands.png', country: 'Netherlands' },
        { image: '/assets/images/small/norway.png', country: 'Norway' },
        { image: '/assets/images/small/south-koria.png', country: 'South Korea' },
        { image: '/assets/images/small/spain.png', country: 'Spain' },
        { image: '/assets/images/small/sweden.png', country: 'Sweden' },
        { image: '/assets/images/small/switzerlands.png', country: 'Switzerland' },
        { image: '/assets/images/small/usa.png', country: 'United States' },
        { image: '/assets/images/small/india.png', country: 'India' },
    ];

    const slides = [
        {
            date: 'March 21, 2020',
            title: 'Containing coronavirus spread comes',
            image: '/assets/images/page-img/40.png',
            description:
                'In the blog post, the IMF experts observed, "Success in containing the virus comes at the price of slowing economic activity, no matter whether social distancing and reduced mobility are voluntary or enforced."',
        },
        {
            date: 'March 21, 2020',
            title: 'Latest coronavirus updates',
            image: '/assets/images/page-img/41.png',
            description:
                'ABC Action News is committed to providing Tampa Bay area residents all of the updates on the coronavirus, COVID-19, and the impact it\'s having on our way of life. To help you stay on top of it all, we\'ll be updating this daily blog as we continue to get through this together.',
        },
        {
            date: 'March 21, 2020',
            title: 'False Hope about Coronavirus',
            image: '/assets/images/page-img/42.png',
            description:
                'While patients can and do recover from coronavirus infections, there are currently no approved treatments that are known to work against COVID-19. He said at his press briefing yesterday, that two drugs, hydroxychloroquine and remdesivir.',
        },
        {
            date: 'March 21, 2020',
            title: 'Coronavirus in Maine Blog',
            image: '/assets/images/page-img/43.png',
            description:
                'This now includes cases formerly identified as presumptive positive. This classification applies to samples sent by a health provider directly to HETL that test positive and to samples from non-governmental labs for which HETL validates positive results.',
        },
    ];

    useEffect(() => {
        am4core.ready(() => {
            am4core.useTheme(am4themes_animated);

            let chart = am4core.create("world-map", am4maps.MapChart);

            chart.geodata = am4geodata_worldLow;
            chart.logo.disabled = true;

            chart.projection = new am4maps.projections.Miller();

            let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.exclude = ["AQ"];

            polygonSeries.useGeodata = true;

            let polygonTemplate = polygonSeries.mapPolygons.template;
            polygonTemplate.tooltipText = "{name}";
            polygonTemplate.fill = chart.colors.getIndex(0).lighten(0.5);

            let hs = polygonTemplate.states.create("hover");
            hs.properties.fill = chart.colors.getIndex(0);

            // Add image series
            let imageSeries = chart.series.push(new am4maps.MapImageSeries());
            imageSeries.mapImages.template.propertyFields.longitude = "longitude";
            imageSeries.mapImages.template.propertyFields.latitude = "latitude";

            // Image series data
            imageSeries.data = [
                { title: "Brussels", latitude: 50.8371, longitude: 4.3676 },
                { title: "Copenhagen", latitude: 55.6763, longitude: 12.5681 },
                { title: "Paris", latitude: 48.8567, longitude: 2.351 },
                { title: "Reykjavik", latitude: 64.1353, longitude: -21.8952 },
                { title: "Moscow", latitude: 55.7558, longitude: 37.6176 },
                { title: "Madrid", latitude: 40.4167, longitude: -3.7033 },
                { title: "London", latitude: 51.5002, longitude: -0.1262, url: "http://www.google.co.uk" },
                { title: "Peking", latitude: 39.9056, longitude: 116.3958 },
                { title: "New Delhi", latitude: 28.6353, longitude: 77.225 },
                { title: "Tokyo", latitude: 35.6785, longitude: 139.6823, url: "http://www.google.co.jp" },
                { title: "Ankara", latitude: 39.9439, longitude: 32.856 },
                { title: "Buenos Aires", latitude: -34.6118, longitude: -58.4173 },
                { title: "Brasilia", latitude: -15.7801, longitude: -47.9292 },
                { title: "Ottawa", latitude: 45.4235, longitude: -75.6979 },
                { title: "Washington", latitude: 38.8921, longitude: -77.0241 },
                { title: "Kinshasa", latitude: -4.3369, longitude: 15.3271 },
                { title: "Cairo", latitude: 30.0571, longitude: 31.2272 },
                { title: "Pretoria", latitude: -25.7463, longitude: 28.1876 }
            ];

            chart.events.on("ready", updateCustomMarkers);
            chart.events.on("mappositionchanged", updateCustomMarkers);

            function updateCustomMarkers() {
                imageSeries.mapImages.each((image) => {
                    if (!image.dummyData || !image.dummyData.externalElement) {
                        image.dummyData = {
                            externalElement: createCustomMarker(image),
                        };
                    }

                    let xy = chart.geoPointToSVG({
                        longitude: image.longitude,
                        latitude: image.latitude,
                    });
                    image.dummyData.externalElement.style.top = `${xy.y}px`;
                    image.dummyData.externalElement.style.left = `${xy.x}px`;
                });
            }

            function createCustomMarker(image) {
                let holder = document.createElement("div");
                holder.className = "map-marker";
                holder.title = image.dataItem.dataContext.title;
                holder.style.position = "absolute";

                if (image.url) {
                    holder.onclick = () => (window.location.href = image.url);
                    holder.className += " map-clickable";
                }

                let dot = document.createElement("div");
                dot.className = "dot";
                holder.appendChild(dot);

                let pulse = document.createElement("div");
                pulse.className = "pulse";
                holder.appendChild(pulse);

                chart.svgContainer.htmlElement.appendChild(holder);
                return holder;
            }

            return () => {
                chart.dispose();
            };
        });
    }, []);



    return (
        <>
            <Row>
                <Col sm={12}>
                    <Row>
                        <Col md={6} lg={3}>
                            <Card className="card-block card-stretch card-height">
                                <Card.Body className="d-flex">
                                    <div className="d-flex align-items-center justify-content-between flex-grow-1">
                                        <div className="text-left">
                                            <h4 className="mb-2 mt-2">Confirm</h4>
                                            <h3 className="mb-0 line-height">183,325</h3>
                                        </div>
                                        <div className="rounded-circle card-icon bg-primary">
                                            <i className="ri-task-line text-white"></i>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="card-block card-stretch card-height">
                                <Card.Body className="d-flex">
                                    <div className="d-flex align-items-center justify-content-between flex-grow-1">
                                        <div className="text-left">
                                            <h4 className="mb-2 mt-2">Recovered</h4>
                                            <h3 className="mb-0 line-height">79,908</h3>
                                        </div>
                                        <div className="rounded-circle card-icon bg-warning">
                                            <i className="ri-hospital-line text-white"></i>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="card-block card-stretch card-height">
                                <Card.Body className="d-flex">
                                    <div className="d-flex align-items-center justify-content-between flex-grow-1">
                                        <div className="text-left">
                                            <h4 className="mb-2 mt-2">Death</h4>
                                            <h3 className="mb-0 line-height">7,177</h3>
                                        </div>
                                        <div className="rounded-circle card-icon bg-danger ">
                                            <i className="ri-gradienter-line text-white"></i>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="card-block card-stretch card-height">
                                <Card.Body
                                    className="P-0 rounded"
                                    style={{
                                        background: `url(${backgroundImage}) no-repeat scroll center center`,
                                        backgroundSize: 'contain',
                                        minHeight: '127px'
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col sm={12}>
                    <Card className="card-block card-stretch card-height">
                        <Card.Body>
                            <div id="world-map" style={{ width: "100%", height: "400px" }} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="card-block card-stretch card-height">
                        <Card.Header className="d-flex justify-content-between ">
                            <div className="header-title">
                                <h4 className="card-title">Global Record</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div className="table-responsive">
                                <Table className="mb-0 table-borderless">
                                    <thead>
                                        <tr>
                                            <th scope="col">Country</th>
                                            <th scope="col">Confirm</th>
                                            <th scope="col">Recover</th>
                                            <th scope="col">Death</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((record, index) => (
                                            <tr key={record.country}>
                                                <td>
                                                    <img
                                                        src={generatePath(record.flag)}
                                                        className="img-fluid"
                                                        alt={`${record.country} flag`}
                                                    />{' '}
                                                    {record.country}
                                                </td>
                                                <td>{record.confirm}</td>
                                                <td>{record.recover}</td>
                                                <td>{record.death}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="card-block card-stretch card-height">
                        <Card.Header className="d-flex justify-content-between ">
                            <div className="header-title">
                                <h4 className="card-title">{title}</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {tips.map((tip, index) => (
                                <div className={`d-flex ${index !== 3 && 'mb-4'}`} key={index}>
                                    <img src={generatePath(tip.image)} className="align-self-start me-3 avatar-80 flex-shrink-0" alt={tip.header} />
                                    <div className="media-body">
                                        <h5>{tip.header}</h5>
                                        <p className="mb-0">{tip.description}</p>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12}
                    className="mb-4">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24}
                        slidesPerView={4}
                        loop={true}
                        speed={1000}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        breakpoints={{
                            1200: { slidesPerView: 4 },
                            992: { slidesPerView: 3 },
                            768: { slidesPerView: 3 },
                            576: { slidesPerView: 2 },
                            0: { slidesPerView: 1 },
                        }}
                        className="ele-widget-swiper navigation-on-hover"
                    >
                        {helpLines.map((line, index) => (
                            <SwiperSlide key={index}>
                                <Card className="card-block card-stretch card-height mb-0">
                                    <Card.Body>
                                        <img
                                            className="arrow-img w-auto mb-3"
                                            src={generatePath(line.image)}
                                            alt={`Help line for ${line.country}`}
                                        />
                                        <h5 className="contact-number">
                                            <i aria-hidden="true" className="ion ion-android-call"></i>{" "}
                                            + 1 800 324 2323
                                        </h5>
                                        <p className="mb-0">Help line {line.country}</p>
                                    </Card.Body>
                                </Card>
                            </SwiperSlide>
                        ))}
                        <div className="iqonic-navigation-custom iq-navi navigation-center">
                            <div className="iqonic-navigation d-flex">
                                <div className="swiper-buttons swiper-button-prev" role="button" aria-label="Previous slide">
                                    <i className="ri-arrow-left-s-line"></i>
                                </div>
                                <div className="swiper-buttons swiper-button-next" role="button" aria-label="Next slide">
                                    <i className="ri-arrow-right-s-line"></i>
                                </div>
                            </div>
                        </div>
                    </Swiper>
                </Col>
                <Col sm={12} className="mt-2">
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            nextEl: '.cust-swiper-button-next',
                            prevEl: '.cust-swiper-button-prev',
                        }}
                        slidesPerView={3}
                        spaceBetween={24}
                        loop={true}
                        speed={1000}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                            },
                            576: {
                                slidesPerView: 1,
                            },
                            768: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                            1500: {
                                slidesPerView: 3,
                            },
                        }}
                        className="ele-widget-swiper dasb-cust-swiper"
                    >
                        {slides.map((slide, index) => (
                            <SwiperSlide key={index}>
                                <div className="card card-block card-stretch card-height">
                                    <div className="image-block">
                                        <img src={generatePath(slide.image)} className="img-fluid w-100" alt="blog-img" />
                                    </div>
                                    <div className="card-body">
                                        <div className="blog-description">
                                            <div className="blog-meta">
                                                <a href="#">{slide.date}</a>
                                            </div>
                                            <h4 className="mb-2">{slide.title}</h4>
                                            <p>{slide.description}</p>
                                            <a href="#">Read More <i className="ri-arrow-right-s-line"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                        <div className="iqonic-navigation-custom navigation-center">
                            <div className="iqonic-navigation">
                                <Button className="cust-swiper-button-prev swiper-buttons swiper-button-prev" aria-label="Previous slide">
                                    <i className="ri-arrow-left-s-line"></i>
                                </Button>
                                <Button className="cust-swiper-button-next swiper-buttons swiper-button-next" aria-label="Next slide">
                                    <i className="ri-arrow-right-s-line"></i>
                                </Button>
                            </div>
                        </div>
                    </Swiper>

                </Col>
            </Row>
        </>
    );
};


export default CovidNineteenDashboard;
