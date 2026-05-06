import { memo, Fragment } from "react";

// React-bootstrap
import { Breadcrumb, Container, Row, Col } from "react-bootstrap";

// component
import Card from '../../components/Card'

const Breadcrumbs = memo(() => {
  return (
    <Fragment>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Use the items in order to programatically generate the
                breadcrumb links.use class <code> .breadcrumb to ol </code>
              </p>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item active>Home</Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item active >
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="#" >
                  Library
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Data</Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb With Icon</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Use the items in order to programatically generate the
                breadcrumb links.use class <code> .breadcrumb to ol</code>{" "}with Icon
              </p>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item active>
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item href="#">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb">
                <Breadcrumb.Item href="#">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home</Breadcrumb.Item>
                <Breadcrumb.Item href="#" >
                  Library
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Data</Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                use class
                <code>{" "}.breadcrumb .bg-primary</code>
              </p>
              <Breadcrumb bsPrefix="breadcrumb bg-primary p-3 rounded-2 ">
                <Breadcrumb.Item active className="text-white">
                  Home
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary p-3 rounded-2 cust-breadcrumb">
                <Breadcrumb.Item className="text-white">
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="text-white">
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary mb-0 p-3 rounded-2 cust-breadcrumb" >
                <Breadcrumb.Item className="text-white">
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-white">
                  Library
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="text-white">
                  Data
                </Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb With Icon</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                use class <code> .breadcrumb .bg-primary </code> With Icon.
              </p>
              <Breadcrumb bsPrefix="breadcrumb bg-primary p-3 rounded-2">
                <Breadcrumb.Item active className="text-white">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary p-3 rounded-2 cust-breadcrumb">
                <Breadcrumb.Item className="text-white">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="text-white">
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary mb-0 p-3 rounded-2 cust-breadcrumb">
                <Breadcrumb.Item className="text-white">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-white">
                  Library
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="text-white">
                  Data
                </Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb With Icon</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                use class <code>{" "}.breadcrumb .bg-primary-subtle</code>
              </p>
              <Breadcrumb bsPrefix="breadcrumb bg-primary-subtle p-3 rounded-2">
                <Breadcrumb.Item active>
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary-subtle p-3 rounded-2">
                <Breadcrumb.Item href="#">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-primary-subtle mb-0 p-3 rounded-2">
                <Breadcrumb.Item href="#">
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item href="#">
                  Library
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Data</Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Breadcrumb With Icon</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                use class
                <code> .breadcrumb .bg-danger-subtle</code>
              </p>
              <Breadcrumb bsPrefix="breadcrumb bg-danger-subtle p-3 rounded-2">
                <Breadcrumb.Item active>
                  <i className="ri-home-4-line me-1 float-start"></i>
                  Home
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-danger-subtle p-3 rounded-2">
                <Breadcrumb.Item className="text-danger">
                  <i className="ri-home-4-line me-1 float-start text-danger"></i>
                  <span className="text-danger">Home</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                  Library
                </Breadcrumb.Item>
              </Breadcrumb>
              <Breadcrumb bsPrefix="breadcrumb bg-danger-subtle mb-0 p-3 rounded-2">
                <Breadcrumb.Item className="text-danger">
                  <i className="ri-home-4-line me-1 float-start text-danger"></i>
                  <span className="text-danger">Home</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-danger">
                  <span className="text-danger">Library</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Data</Breadcrumb.Item>
              </Breadcrumb>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment >
  );
});

Breadcrumbs.displayName = "Breadcrumbs";
export default Breadcrumbs;