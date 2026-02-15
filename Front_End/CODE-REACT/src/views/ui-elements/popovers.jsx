import React, { Fragment } from "react";
import { Col, Row, Button, OverlayTrigger, Popover } from "react-bootstrap";
import Card from "../../components/Card";

const Popovers = () => {
  return (
    <Fragment>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Popovers</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Header as="h3">Popover title</Popover.Header>
                    <Popover.Body>
                      And here&apos;s some amazing content. It&apos;s very engaging.
                      Right?
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button className="btn-lg" variant="danger">
                  Click to toggle popover
                </Button>
              </OverlayTrigger>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Dismiss On Next Click</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Use the <code>focus</code> trigger to dismiss popovers on the
                user’s next click of a different element than the toggle
                element.
              </p>
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Header as="h3">Dismissible popover</Popover.Header>
                    <Popover.Body>
                      And here&apos;s some amazing content. It&apos;s very engaging.
                      Right?
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="danger-subtle">Dismissible popover</Button>
              </OverlayTrigger>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Disabled Elements</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Elements with the <code>disabled</code> attribute aren’t
                interactive, meaning users cannot hover or click them to trigger
                a popover (or tooltip). As a workaround, you’ll want to trigger
                the popover from a wrapper <code>&lt;div&gt;</code> or{" "}
                <code>&lt;span&gt;</code> and override the{" "}
                <code>pointer-events</code> on the disabled element.
              </p>
              <span
                className="d-inline-block" 
              >

                <span className="d-inline-block">
                  <Button disabled style={{ pointerEvents: "none" }}>
                    Disabled button
                  </Button>
                </span>
              </span>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Hover Elements</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                For disabled popover triggers, you may also prefer{" "}
                <code>data-bs-trigger=&quot;hover&quot;</code> so that the popover appears
                as immediate visual feedback to your users as they may not
                expect to <em>click</em> on a disabled element.
              </p>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Disabled popover
                    </Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="d-inline-block"
                  data-bs-toggle="popover"
                  data-bs-content="Disabled popover"
                >
                  <Button
                    className="btn-primary"
                    style={{ pointerEvents: "none" }}
                    disabled
                  >
                    Disabled button
                  </Button>
                </span>
              </OverlayTrigger>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Four Directions</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Four options are available: top, right, bottom, and left
                aligned.
              </p>
              <OverlayTrigger
                trigger="click"
                placement="top"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="secondary-subtle mb-3">Popover on top</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="secondary-subtle mb-3">Popover on right</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="secondary-subtle mb-3">Popover on bottom</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="left"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="secondary-subtle mb-3">Popover on left</Button>
              </OverlayTrigger>{" "}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Popovers With Color</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Four options are available: top, right, bottom, and left
                aligned.
              </p>
              <OverlayTrigger
                trigger="click"
                placement="top"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="primary-subtle mb-3">Popover on top</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="success-subtle mb-3">Popover on right</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="danger-subtle mb-3">Popover on bottom</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="left"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="info-subtle mb-3">Popover on left</Button>
              </OverlayTrigger>{" "}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Popovers With Color</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Four options are available: top, right, bottom, and left
                aligned.
              </p>
              <OverlayTrigger
                trigger="click"
                placement="top"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="primary-subtle mb-3">Popover on top</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="success-subtle mb-3">Popover on right</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="danger-subtle mb-3">Popover on bottom</Button>
              </OverlayTrigger>{" "}
              <OverlayTrigger
                trigger="click"
                placement="left"
                overlay={
                  <Popover id="popover-basic">
                    <Popover.Body>
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Button variant="info-subtle mb-3">Popover on left</Button>
              </OverlayTrigger>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Popovers
