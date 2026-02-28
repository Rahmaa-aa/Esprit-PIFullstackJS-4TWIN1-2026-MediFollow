import { memo, Fragment } from "react";

// react-bootstrap
import { Button, CardBody, Col, Dropdown, Row } from "react-bootstrap";

// component
import Card from '../../components/Card'
// import CustomToggle from "../../../components/dropdowns";

const Buttons = memo(() => {
  return (
    <Fragment>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Default Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="btn-primary border-primary-subtle mb-3">
                Primary
              </Button>{" "}
              <Button variant="secondary-subtle" className="btn-secondary border-secondary-subtle mb-3 ">
                Secondary
              </Button>{" "}
              <Button variant="success-subtle" className="btn-secondary border-success-subtle mb-3">
                Success
              </Button>{" "}
              <Button variant="danger-subtle" className="btn-secondary border-danger-subtle mb-3 ">
                Danger
              </Button>{" "}
              <Button variant="warning-subtle" className="btn-secondary border-warning-subtle mb-3 ">
                Warning
              </Button>{" "}
              <Button variant="info-subtle" className="btn-secondary border-info-subtle mb-3 ">
                Info
              </Button>{" "}
              <button className="btn btn-gray-subtle mb-3">
                Light
              </button>{" "}
              <Button variant="dark" className="btn-secondary border-dark mb-3">
                Dark
              </Button>{" "}
              <Button variant="link" className="btn-link mb-3">
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Default Buttons Rounded Shape</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="rounded-pill mb-3">
                Primary
              </Button>{" "}
              <Button variant="secondary-subtle" className="rounded-pill mb-3">
                Secondary
              </Button>{" "}
              <Button variant="success-subtle" className="rounded-pill mb-3">
                Success
              </Button>{" "}
              <Button variant="danger-subtle" className="rounded-pill mb-3">
                Danger
              </Button>{" "}
              <Button variant="warning-subtle" className="rounded-pill mb-3">
                Warning
              </Button>{" "}
              <Button variant="info-subtle" className="rounded-pill mb-3">
                Info
              </Button>{" "}
              <Button variant="gray-subtle" className="rounded-pill mb-3">
                Light
              </Button>{" "}
              <Button variant="dark" className="rounded-pill mb-3">
                Dark
              </Button>{" "}
              <Button variant="link" className="rounded-pill mb-3">
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Outline Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="outline-primary" className="mb-3">
                Primary
              </Button>{" "}
              <Button variant="outline-secondary" className="mb-3">
                Secondary
              </Button>{" "}
              <Button variant="outline-success" className="mb-3">
                Success
              </Button>{" "}
              <Button variant="outline-danger" className="mb-3">
                Danger
              </Button>{" "}
              <Button variant="outline-warning" className="mb-3">
                Warning
              </Button>{" "}
              <Button variant="outline-info" className="mb-3">
                Info
              </Button>{" "}
              <Button variant="outline-dark" className="mb-3 custom-dark-button">
                Dark
              </Button>{" "}
              <Button variant="link" className="btn-link mb-3">
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Rounded Outline Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="outline-primary" className="rounded-pill mb-3">
                Primary
              </Button>{" "}
              <Button variant="outline-secondary" className="rounded-pill mb-3">
                Secondary
              </Button>{" "}
              <Button variant="outline-success" className="rounded-pill mb-3">
                Success
              </Button>{" "}
              <Button variant="outline-danger" className="rounded-pill mb-3">
                Danger
              </Button>{" "}
              <Button variant="outline-warning" className="rounded-pill mb-3">
                Warning
              </Button>{" "}
              <Button variant="outline-info" className="rounded-pill mb-3">
                Info
              </Button>{" "}
              <Button variant="outline-dark" className="rounded-pill mb-3 custom-dark-button">
                Dark
              </Button>{" "}
              <Button variant="link" className="btn-link mb-3">
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Default Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="btn mb-3">
                <i className="ri-bill-fill"></i>
                Primary
              </Button>{" "}
              <Button variant="secondary-subtle" className="btn mb-3">
                <i className="ri-heart-fill"></i>
                Secondary
              </Button>{" "}
              <Button variant="success-subtle" className="btn mb-3">
                <i className="ri-bill-fill"></i>
                Success
              </Button>{" "}
              <Button variant="danger-subtle" className="btn mb-3">
                <i className="ri-heart-fill"></i>
                Danger
              </Button>{" "}
              <Button variant="warning-subtle" className="btn mb-3">
                <i className="ri-bill-fill"></i>
                Warning
              </Button>{" "}
              <Button
                variant="info-subtle"
                className="btn mb-3"
              >
                <i className="ri-heart-fill"></i>
                Info
              </Button>{" "}
              <Button variant="gray-subtle" className="btn mb-3">
                <i className="ri-bill-fill"></i>
                Light
              </Button>{" "}
              <Button variant="dark-subtle" className="btn mb-3">
                <i className="ri-heart-fill"></i>
                Dark
              </Button>{" "}
              <Button variant="link" className="btn mb-3">
                <i className="ri-bill-fill"></i>
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Default Buttons Rounded Shape</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button
                variant="primary"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-bill-fill"></i>
                Primary
              </Button>{" "}
              <Button
                variant="secondary"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-heart-fill"></i>
                Secondary
              </Button>{" "}
              <Button
                variant="success-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-bill-fill"></i>
                Success
              </Button>{" "}
              <Button
                variant="danger-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-heart-fill"></i>
                Danger
              </Button>{" "}
              <Button
                variant="warning-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-bill-fill"></i>
                Warning
              </Button>{" "}
              <Button
                variant="info-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-heart-fill"></i>
                Info
              </Button>{" "}
              <Button
                variant="gray-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-bill-fill"></i>
                Light
              </Button>{" "}
              <Button
                variant="dark-subtle"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-heart-fill"></i>
                Dark
              </Button>{" "}
              <Button
                variant="link"
                className="rounded-pill btn mb-3"
              >
                <i className="ri-bill-fill"></i>
                Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Outline Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="outline-primary" className="mb-3">
                <i className="ri-heart-line"></i>Primary
              </Button>{" "}
              <Button variant="outline-secondary" className="mb-3">
                <i className="ri-alert-fill"></i>Secondary
              </Button>{" "}
              <Button variant="outline-success" className="mb-3">
                <i className="ri-heart-line"></i>Success
              </Button>{" "}
              <Button variant="outline-danger" className="mb-3">
                <i className="ri-alert-fill"></i>Danger
              </Button>{" "}
              <Button variant="outline-warning" className="mb-3">
                <i className="ri-heart-line"></i>Warning
              </Button>{" "}
              <Button variant="outline-info" className="mb-3">
                <i className="ri-alert-fill"></i>Info
              </Button>{" "}
              <Button variant="outline-dark" className="mb-3">
                <i className="ri-alert-fill"></i>Dark
              </Button>{" "}
              <Button variant="outline-link text-primary" className="mb-3">
                <i className="ri-heart-line"></i>Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Rounded Outline Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="outline-primary" className="rounded-pill mb-3">
                <i className="ri-heart-line"></i>Primary
              </Button>{" "}
              <Button variant="outline-secondary" className="rounded-pill mb-3">

                <i className="ri-alert-fill"></i>Secondary
              </Button>{" "}
              <Button variant="outline-success" className="rounded-pill mb-3">
                <i className="ri-heart-line"></i>Success
              </Button>{" "}
              <Button variant="outline-danger" className="rounded-pill mb-3">
                <i className="ri-alert-fill"></i>Danger
              </Button>{" "}
              <Button variant="outline-warning" className="rounded-pill mb-3">
                <i className="ri-heart-line"></i>Warning
              </Button>{" "}
              <Button variant="outline-info" className="rounded-pill mb-3">
                <i className="ri-alert-fill"></i>Info
              </Button>{" "}
              <Button variant="outline-dark" className="rounded-pill mb-3">
                <i className="ri-alert-fill"></i>Dark
              </Button>{" "}
              <Button variant="outline-link text-primary" className="rounded-pill mb-3">
                <i className="ri-heart-line"></i>Link
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Button Tags</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="mb-3 mb-md-0" to="#" role="button">
                Link
              </Button>{" "}
              <Button variant="success-subtle" className="mb-3 mb-md-0" type="submit">
                Button
              </Button>{" "}
              <Button
                variant="danger-subtle"
                className="mb-3 mb-md-0"
                type="button"
                defaultValue="Input"
              >Input{" "}</Button>{" "}
              <Button
                variant="warning-subtle"

                type="submit"
                defaultValue="Submit"
              >Submit{" "}</Button>{" "}
              <Button variant="primary-subtle" type="reset" defaultValue="Reset" >Reset{" "}</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Buttons Sizes</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" size="sm" className="me-2 mb-2 mb-md-0">
                Small Button
              </Button>{" "}
              <Button variant="success-subtle" className="me-2 mb-3 mb-md-0">
                Button
              </Button>{" "}
              <Button variant="info-subtle" size="lg" className="mb-1 mb-md-0">
                Large Button
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Block Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="btn-block mb-2 mb-md-0">
                Block level button
              </Button>{" "}
              <Button variant="success-subtle" className="btn-block">
                Block level button
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Icons Buttons</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" className="mb-3">
                <i className="ri-heart-fill pe-0"></i>
              </Button>{" "}
              <Button variant="secondary-subtle" className="mb-3">
                <i className="ri-star-fill pe-0"></i>
              </Button>{" "}
              <Button variant="success-subtle" className="mb-3">
                <i className="ri-settings-4-fill pe-0"></i>
              </Button>{" "}
              <Button variant="danger-subtle" className="mb-3">
                <i className="ri-radio-button-fill pe-0"></i>
              </Button>{" "}
              <Button variant="warning-subtle" className="mb-3">
                <i className="ri-delete-bin-2-fill pe-0"></i>
              </Button>{" "}
              <Button variant="info-subtle" className="mb-3">
                <i className="ri-lock-fill pe-0"></i>
              </Button>{" "}
              <Button variant="gray-subtle" className="mb-3">
                <i className="ri-time-fill pe-0"></i>
              </Button>{" "}
              <Button variant="dark-subtle" className="mb-3">
                <i className="ri-sun-fill pe-0"></i>
              </Button>{" "}
              <Button variant="" className="btn-md btn-link-subtle mb-3"><i class="ri-moon-fill pe-0"></i></Button>
              <div className="d-inline-block w-100 mt-3">
                <Button variant="primary-subtle" className="mb-3">
                  <i className="ri-heart-fill"></i>
                  Buttons
                </Button>{" "}
                <Button variant="secondary-subtle" className="mb-3">
                  <i className="ri-star-fill"></i>
                  Buttons
                </Button>{" "}
                <Button variant="success-subtle" className="mb-3">
                  <i className="ri-settings-4-fill"></i>
                  Buttons
                </Button>{" "}
                <Button variant="danger-subtle" className="mb-3">
                  <i className="ri-radio-button-fill"></i>
                  Buttons
                </Button>{" "}
                <Button variant="info-subtle" className="mb-3">
                  <i className="ri-lock-fill"></i>
                  Buttons
                </Button>{" "}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Social Disabled State</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary" disabled>
                Primary button
              </Button>{" "}
              <Button variant="success" disabled>
                Button
              </Button>{" "}
              <Button variant="outline-primary" className="text-white" disabled>
                Button
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Buttons Toggle States</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary-subtle" >
                Single toggle
              </Button>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Default Buttons Active</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <Button variant="primary" className="active mb-3">
                Active
              </Button>{" "}
              <Button variant="secondary" className="active mb-3">
                Active
              </Button>{" "}
              <Button variant="warning" className="active mb-3">
                Active
              </Button>{" "}
              <Button variant="accent" className="mb-3" disabled>
                Disabled
              </Button>{" "}
              <Button variant="primary" className="mb-3" disabled>
                Disabled
              </Button>{" "}
              <Button variant="outline-primary" className="mb-3 text-white" disabled>
                Disabled
              </Button>{" "}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Button Group Sizing</h4>
              </Card.Header.Title>
            </Card.Header>
            <CardBody className="ui-button-group">
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <div className="d-block">
                <div
                  className="btn-group btn-group-lg"
                  role="group"
                  aria-label="Basic example"
                >
                  <Button type="button" variant="primary-subtle" >
                    Left
                  </Button>
                  <Button type="button" variant="primary-subtle" >
                    Middle
                  </Button>
                  <Button type="button" variant="primary-subtle" >
                    Right
                  </Button>
                </div>
              </div>
              <div className="d-block">
                <div
                  className="btn-group mt-3 btn-group-medium"
                  role="group"
                  aria-label="Basic example"
                >
                  <Button variant="primary-subtle" type="button">
                    Left
                  </Button>
                  <Button variant="primary-subtle" type="button">
                    Middle
                  </Button>
                  <Button variant="primary-subtle" type="button">
                    Right
                  </Button>
                </div>
              </div>
              <div className="d-block">
                <div
                  className="btn-group btn-group-sm mt-3"
                  role="group"
                  aria-label="Basic example"
                >
                  <Button variant="primary-subtle" type="button">
                    Left
                  </Button>
                  <Button variant="primary-subtle" type="button">
                    Middle
                  </Button>
                  <Button variant="primary-subtle" type="button">
                    Right
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Button Group</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <div
                className="btn-group btn-group-medium"
                role="group"
                aria-label="Basic example"
              >
                <Button variant="primary-subtle" type="button">Left</Button>
                <Button variant="primary-subtle" type="button">Middle</Button>
                <Button variant="primary-subtle" type="button">Right</Button>
              </div>
              <div
                className="btn-toolbar mt-3"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group me-2"
                  role="group"
                  aria-label="First group"
                >
                  <Button variant="secondary-subtle" className="mb-2 mb-md-0">1</Button>
                  <Button variant="secondary-subtle" className="mb-2 mb-md-0">2</Button>
                  <Button variant="secondary-subtle" className="mb-2 mb-md-0">3</Button>
                  <Button variant="secondary-subtle" className="mb-2 mb-md-0">4</Button>
                </div>
                <div
                  className="btn-group me-2"
                  role="group"
                  aria-label="Second group"
                >
                  <Button variant="secondary-subtle">5</Button>
                  <Button variant="secondary-subtle">6</Button>
                  <Button variant="secondary-subtle">7</Button>
                </div>
                <div
                  className="btn-group me-2"
                  role="group"
                  aria-label="Third group"
                >
                  <Button variant="secondary-subtle">8</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Button Dropdown</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy
                text ever.
              </p>
              <div
                className="btn-group btn-group-medium"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <Button variant="primary-subtle">1</Button>
                <Button variant="primary-subtle">2</Button>
                <div className="btn-group" role="group">
                  <Dropdown>
                    <Dropdown.Toggle bsPrefix=" " variant="primary gap-1" id="dropdown-basic">
                      Dropdown
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        fill="currentColor"
                        className="bi bi-caret-down-fill"
                        viewBox="0 0 16 16"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        <path d="M7.247 11.14l-4.796-5.481A.5.5 0 0 1 2.454 5h9.092a.5.5 0 0 1 .395.86l-4.796 5.48a.5.5 0 0 1-.798 0z" />
                      </svg>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="#/action-1">Dropdown link</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Dropdown link</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="d-block mt-3">
                <div
                  className="btn-group-vertical "
                  role="group"
                  aria-label="Vertical button group"
                >
                  <div
                    className="btn-group-vertical"
                    role="group"
                    aria-label="Button group with nested dropdown"
                  >
                    <Button variant="primary-subtle" type="button" >
                      1
                    </Button>
                    <Button variant="primary-subtle" type="button">
                      2
                    </Button>
                    <div className="btn-group" role="group">
                      <Dropdown>
                        <Dropdown.Toggle bsPrefix=" " variant="primary gap-1" id="dropdown-basic">
                          Dropdown
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            className="bi bi-caret-down-fill"
                            viewBox="0 0 16 16"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            <path d="M7.247 11.14l-4.796-5.481A.5.5 0 0 1 2.454 5h9.092a.5.5 0 0 1 .395.86l-4.796 5.48a.5.5 0 0 1-.798 0z" />
                          </svg>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item href="#/action-1">Dropdown link</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">Dropdown link</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
});

Buttons.displayName = "Buttons";
export default Buttons;