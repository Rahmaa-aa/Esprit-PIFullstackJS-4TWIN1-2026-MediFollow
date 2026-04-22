import React, { Fragment } from "react";
import { Col, Row, } from "react-bootstrap";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Card from "../../components/Card";
import { Link } from "react-router-dom";

const Progressbars = () => {
  return (
    <Fragment>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Examples</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Progress components are built with two HTML elements, some CSS to set the width, and a few attributes. We don’t use <Link to="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress">the HTML5 <code>&lt;progress&gt;</code> element</Link>, ensuring you can stack progress bars, animate them, and place text labels over them.</p>
              <ul>
                <li>
                  We use the <code>.progress</code> as a wrapper to indicate the
                  max value of the progress bar.
                </li>
                <li>
                  We use the inner <code>.progress-bar</code> to indicate the
                  progress so far.
                </li>
                <li>
                  The <code>.progress-bar</code> requires an inline style,
                  utility class, or custom CSS to set their width.
                </li>
                <li>
                  The <code>.progress-bar</code> also requires some{" "}
                  <code>role</code> and <code>aria</code> attributes to make it
                  accessible.
                </li>
              </ul>
              <p>Put that all together, and you have the following examples.</p>
              <div className="progress mb-3">
                <ProgressBar now={0}></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar style={{ width: "25%" }} now={100} className="custom-progress-bars"></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar style={{ width: "50%" }} now={100} className="custom-progress-bars"></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar style={{ width: "75%" }} now={100} className="custom-progress-bars"></ProgressBar>
              </div>
              <div className="progress">
                <ProgressBar style={{ width: "100%" }} now={100} className="custom-progress-bars"></ProgressBar>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Height</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                We only set a <code>height</code> value on the{" "}
                <code>.progress</code>, so if you change that value the inner{" "}
                <code>.progress-bar</code> will automatically resize
                accordingly.
              </p>
              <div className="progress mb-3" style={{ height: "10px" }}>
                <ProgressBar className="custom-progress-bars"
                  variant="primary"
                  style={{ width: "25%" }}
                  now={100}
                  label={"25%"}
                />
              </div>
              <div className="progress mb-3" style={{ height: "10px" }}>
                <ProgressBar className="custom-progress-bars"
                  variant="primary"
                  style={{ width: "50%" }}
                  now={100}
                  label={"50%"}
                />
              </div>
              <div className="progress mb-3" style={{ height: "15px" }}>
                <ProgressBar className="custom-progress-bars"
                  variant="primary"
                  style={{ width: "75%" }}
                  now={100}
                  label={"75%"}
                />
              </div>
              <div className="progress" style={{ height: "20px" }}>
                <ProgressBar className="custom-progress-bars"
                  variant="primary"
                  style={{ width: "99%", height: "20px" }}
                  now={100}
                  label={"99%"}
                />
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Animated Stripes</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>The striped gradient can also be animated. Add <code>.progress-bar-animated</code> to <code>.progress-bar</code> to animate the stripes right to left via CSS3 animations.</p>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  animated
                  striped
                  now={100}
                  style={{ width: "75%" }}
                ></ProgressBar>
              </div>
              <div className="progress">
                <ProgressBar className="custom-progress-bars"
                  animated
                  striped
                  variant="success"
                  now={100}
                  style={{ width: "75%" }}
                ></ProgressBar>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Labels</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Add labels to your progress bars by placing text within the <code>.progress-bar</code>.</p>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars" style={{ width: "25%" }} label={"25%"} now={100} />
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars" style={{ width: "50%" }} label={"50%"} now={100} />
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars" style={{ width: "75%" }} label={"75%"} now={100} />
              </div>
              <div className="progress">
                <ProgressBar className="custom-progress-bars" style={{ width: "99%" }} label={"99%"} now={100} />
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Backgrounds</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Use background utility classes to change the appearance of
                individual progress bars.
              </p>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  variant="success"
                  role="progressbar"
                  style={{ width: "25%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  variant="info"
                  role="progressbar"
                  style={{ width: "50%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  variant="warning"
                  role="progressbar"
                  style={{ width: "75%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress">
                <ProgressBar className="custom-progress-bars"
                  variant="danger"
                  role="progressbar"
                  style={{ width: "100%" }}
                  now={100}
                ></ProgressBar>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Multiple Bars</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Include multiple progress bars in a progress component if you need.</p>
              <ProgressBar>
                <ProgressBar variant="primary" now={15} key={1} />
                <ProgressBar variant="success" now={30} key={2} />
                <ProgressBar variant="info" now={20} key={3} />
              </ProgressBar>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Striped</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Add <code>.progress-bar-striped</code> to any <code>.progress-bar</code> to apply a stripe via CSS gradient over the progress bar’s background color.</p>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  striped
                  style={{ width: "10%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  striped
                  variant="success"
                  style={{ width: "25%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  striped
                  variant="info"
                  style={{ width: "50%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress mb-3">
                <ProgressBar className="custom-progress-bars"
                  striped
                  variant="warning"
                  style={{ width: "75%" }}
                  now={100}
                ></ProgressBar>
              </div>
              <div className="progress">
                <ProgressBar className="custom-progress-bars"
                  striped
                  variant="danger"
                  style={{ width: "100%" }}
                  now={100}
                ></ProgressBar>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Progressbars;
