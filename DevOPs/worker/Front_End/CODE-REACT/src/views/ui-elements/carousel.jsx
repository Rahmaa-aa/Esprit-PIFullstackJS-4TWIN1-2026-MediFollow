import React, { Fragment } from "react";
import { Carousel, Row, Col } from "react-bootstrap";
import card1 from "/assets/images/small/img-1.jpg";
import Card from "../../components/Card";

const Carousels = () => {
  return (
    <Fragment>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Slides Only</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Here’s a carousel with slides only. Note the presence of the{" "}
                <code>.d-block</code> and <code>.img-fluid</code> on carousel
                images to prevent browser default image alignment.
              </p>
              <Carousel
                id="carouselExampleSlidesOnly"
                indicators={false}
                nextIcon={""}
                prevIcon={""}
                data-ride="carousel"
              >
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
              </Carousel>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Slides With Controls</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Here’s a carousel with slides only. Note the presence of the{" "}
                <code>.d-block</code> and <code>.img-fluid</code> on carousel
                images to prevent browser default image alignment.
              </p>
              <Carousel
                id="carouselExampleControls"
                indicators={false}
              >
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
              </Carousel>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Slides With Indicators</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Here’s a carousel with slides only. Note the presence of the{" "}
                <code>.d-block</code> and <code>.img-fluid</code> on carousel
                images to prevent browser default image alignment.
              </p>
              <Carousel
                id="carouselExampleSlidesOnly"
              // indicators={true}
              >
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                </Carousel.Item>
              </Carousel>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Slides With Captions</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="bd-example">
                <p>
                  Here’s a carousel with slides only. Note the presence of the{" "}
                  <code>.d-block</code> and <code>.img-fluid</code> on carousel
                  images to prevent browser default image alignment.
                </p>
                <Carousel
                  id="carouselExampleSlidesOnly"
                // indicators={true}
                >
                  <Carousel.Item>
                    <img src={card1} className="d-block w-100" alt="#" />
                    <Carousel.Caption className="d-none d-md-block">
                      <h5 className="text-dark">First slide label</h5>
                      <p className="text-dark">
                        Nulla vitae elit libero, a pharetra augue mollis
                        interdum.
                      </p>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={card1} className="d-block w-100" alt="#" />
                    <Carousel.Caption className="d-none d-md-block">
                      <h5 className="text-dark">Second slide label</h5>
                      <p className="text-dark">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={card1} className="d-block w-100" alt="#" />
                    <Carousel.Caption className="d-none d-md-block">
                      <h5 className="text-dark">Third slide label</h5>
                      <p className="text-dark">
                        Praesent commodo cursus magna, vel scelerisque nisl
                        consectetur.
                      </p>
                    </Carousel.Caption>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Slides With Crossfade</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Here’s a carousel with slides only. Note the presence of the
                <code> .d-block</code> and <code>.img-fluid</code> on carousel
                images to prevent browser default image alignment.
              </p>
              <Carousel
                fade
                id="carouselExampleFade"
                indicators={false}
              >
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                  <Carousel.Caption className="d-none d-md-block">
                    {/* <h5 className="text-black">First slide label</h5> */}
                    <p>
                      Some representative placeholder content for the first slide.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                  <Carousel.Caption className="d-none d-md-block">
                    {/* <h5 className="text-black">Second slide label</h5> */}
                    <p>
                      Some representative placeholder content for the first slide.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img src={card1} className="d-block w-100" alt="#" />
                  <Carousel.Caption className="d-none d-md-block">
                    {/* <h5 className="text-black">Third slide label</h5> */}
                    <p>
                      Some representative placeholder content for the first slide.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>

              </Carousel>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

Carousels.displayName = "Carousels";
export default Carousels;