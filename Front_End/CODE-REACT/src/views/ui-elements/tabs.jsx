import React from "react";
import { Row, Col, Nav, Tab } from "react-bootstrap";
import Card from "../../components/Card";

const Tabs = () => {
  return (
    <>
      <Row>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Basic Tabs</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                The base <code>.nav</code> component does not include any{" "}
                <code>.active</code> state. The following examples include
                the class, mainly to demonstrate that this particular class
                does not trigger any special styling.
              </p>
              <Tab.Container defaultActiveKey="firstBasic">
                <Nav variant="tabs" id="nav-tab" role="tablist" as={"ul"}>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="firstBasic"
                      id="nav-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-home"
                      type="button"
                      role="tab"
                      aria-controls="nav-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="secondBasic"
                      id="nav-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-profile"
                      type="button"
                      role="tab"
                      aria-controls="nav-profile"
                      aria-selected="true"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="thirdBasic"
                      id="nav-contact-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-contact"
                      type="button"
                      role="tab"
                      aria-controls="nav-contact"
                      aria-selected="true"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane
                    eventKey="firstBasic"
                    id="nav-home"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="secondBasic"
                    id="nav-profile"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="thirdBasic"
                    id="nav-contact"
                    role="tabpanel"
                    aria-labelledby="nav-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Basic Tabs Style 3</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Takes the basic nav from above and adds the{" "}
                <code>.nav-tabs</code> class to generate a tabbed interface.
              </p>
              <Tab.Container defaultActiveKey="firstTabs3">
                <Nav
                  variant="tabs"
                  id="nav-tab"
                  role="tablist"
                  as={"ul"}
                >
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="firstTabs3"
                      variant=" d-flex align-items-center"
                      id="nav-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-home"
                      type="button"
                      role="tab"
                      aria-controls="nav-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="secondTabs3"
                      variant=""
                      id="nav-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-profile"
                      type="button"
                      role="tab"
                      aria-controls="nav-profile"
                      aria-selected="false"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="thirdTabs3"
                      variant=""
                      id="nav-contact-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-contact"
                      type="button"
                      role="tab"
                      aria-controls="nav-contact"
                      aria-selected="false"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane
                    eventKey="firstTabs3"
                    id="nav-home"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-profile"
                    eventKey="secondTabs3"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-contact"
                    eventKey="thirdTabs3"
                    role="tabpanel"
                    aria-labelledby="nav-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Tabs Vertical Pills</h4>
              </div>
            </Card.Header>
            <Card.Body className="custom-tabs-vertical-pills">
              <p>Stack your navigation by changing the flex item direction with the <code>.flex-column</code> utility.</p>
              <Row>
                <Tab.Container defaultActiveKey="firstVertical">
                  <Col sm="3">
                    <Nav
                      as="ul"
                      variant="pills"
                      className="flex-column text-center"
                      id="v-pills-tab"
                      aria-orientation="vertical"
                    >
                      <Nav.Link
                        eventKey="firstVertical"
                        id="v-pills-home-tab"
                        data-bs-toggle="pill"
                        role="tab"
                        aria-controls="v-pills-home"
                        aria-selected="true"
                      >
                        Home
                      </Nav.Link>
                      <Nav.Link
                        eventKey="secondVertical"
                        id="v-pills-profile-tab"
                        data-bs-toggle="pill"
                        role="tab"
                        aria-controls="v-pills-profile"
                        aria-selected="false"
                      >
                        Profile
                      </Nav.Link>
                      <Nav.Link
                        eventKey="thirdVertical"
                        id="v-pills-messages-tab"
                        data-bs-toggle="pill"
                        role="tab"
                        aria-controls="v-pills-messages"
                        aria-selected="false"
                      >
                        Messages
                      </Nav.Link>
                      <Nav.Link
                        eventKey="fourthVertical"
                        id="v-pills-settings-tab"
                        data-bs-toggle="pill"
                        role="tab"
                        aria-controls="v-pills-settings"
                        aria-selected="false"
                      >
                        Settings
                      </Nav.Link>
                    </Nav>
                  </Col>
                  <Col sm="9">
                    <Tab.Content className="mt-0" id="v-pills-tabContent">
                      <Tab.Pane
                        eventKey="firstVertical"
                        id="v-pills-home"
                        role="tabpanel"
                        aria-labelledby="v-pills-home-tab"
                      >
                        <p>
                          Lorem Ipsum is simply dummy text of the printing
                          and typesetting industry. Lorem Ipsum has been the
                          industry&apos;s standard dummy text ever since the
                          1500s, when an unknown printer took a galley of
                          type and scrambled it to make a type specimen
                          book. It has survived not only five centuries, but
                          also the leap into electronic typesetting,
                          remaining essentially unchanged.
                        </p>
                      </Tab.Pane>
                      <Tab.Pane
                        eventKey="secondVertical"
                        id="v-pills-profile"
                        role="tabpanel"
                        aria-labelledby="v-pills-profile-tab"
                      >
                        <p>
                          Lorem Ipsum is simply dummy text of the printing
                          and typesetting industry. Lorem Ipsum has been the
                          industry&apos;s standard dummy text ever since the
                          1500s, when an unknown printer took a galley of
                          type and scrambled it to make a type specimen
                          book. It has survived not only five centuries, but
                          also the leap into electronic typesetting,
                          remaining essentially unchanged.
                        </p>
                      </Tab.Pane>
                      <Tab.Pane
                        eventKey="thirdVertical"
                        id="v-pills-messages"
                        role="tabpanel"
                        aria-labelledby="v-pills-messages-tab"
                      >
                        <p>
                          Lorem Ipsum is simply dummy text of the printing
                          and typesetting industry. Lorem Ipsum has been the
                          industry&apos;s standard dummy text ever since the
                          1500s, when an unknown printer took a galley of
                          type and scrambled it to make a type specimen
                          book. It has survived not only five centuries, but
                          also the leap into electronic typesetting,
                          remaining essentially unchanged.
                        </p>
                      </Tab.Pane>
                      <Tab.Pane
                        eventKey="fourthVertical"
                        id="v-pills-settings"
                        role="tabpanel"
                        aria-labelledby="v-pills-settings-tab"
                      >
                        <p>
                          Lorem Ipsum is simply dummy text of the printing
                          and typesetting industry. Lorem Ipsum has been the
                          industry&apos;s standard dummy text ever since the
                          1500s, when an unknown printer took a galley of
                          type and scrambled it to make a type specimen
                          book. It has survived not only five centuries, but
                          also the leap into electronic typesetting,
                          remaining essentially unchanged.
                        </p>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Tab.Container>
              </Row>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Tabs Justify Center</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Centered with <code>.justify-content-center</code></p>
              <Tab.Container defaultActiveKey="firstJustify">
                {/* <Nav> */}
                <Nav
                  variant="tabs"
                  className="justify-content-center"
                  id="nav-tab"
                  role="tablist"
                  as={"ul"}
                >
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="firstJustify"
                      variant=" d-flex align-items-center"
                      id="nav-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-home"
                      type="button"
                      role="tab"
                      aria-controls="nav-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="secondJustify"
                      variant=""
                      id="nav-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-profile"
                      type="button"
                      role="tab"
                      aria-controls="nav-profile"
                      aria-selected="false"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="thirdJustify"
                      variant=""
                      id="nav-contact-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-contact"
                      type="button"
                      role="tab"
                      aria-controls="nav-contact"
                      aria-selected="false"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                {/* </Nav> */}
                <Tab.Content>
                  <Tab.Pane
                    eventKey="firstJustify"
                    id="nav-home"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-profile"
                    eventKey="secondJustify"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-contact"
                    eventKey="thirdJustify"
                    role="tabpanel"
                    aria-labelledby="nav-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
        <Col sm="12" lg="6">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Basic Tabs Style 2</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Take that same HTML, but use <code>.nav-pills</code>{" "}
                instead:
              </p>
              <Tab.Container defaultActiveKey="firstTabs">
                <Nav
                  variant="pills"
                  className="mb-3"
                  id="pills-tab"
                  role="tablist"
                >
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="firstTabs"
                      className="nav-link"
                      id="pills-home-tab"
                      data-bs-toggle="pill"
                      href="#pills-home"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="secondTabs"
                      className="nav-link"
                      id="pills-profile-tab"
                      data-bs-toggle="pill"
                      href="#pills-profile"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="false"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="thirdTabs"
                      className="nav-link"
                      id="pills-contact-tab"
                      data-bs-toggle="pill"
                      href="#pills-contact"
                      role="tab"
                      aria-controls="pills-contact"
                      aria-selected="false"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content
                  className="tab-content"
                  id="pills-tabContent-2"
                >
                  <Tab.Pane
                    eventKey="firstTabs"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="secondTabs"
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="thirdTabs"
                    id="pills-contact"
                    role="tabpanel"
                    aria-labelledby="pills-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Basic Tabs Style 4</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Takes the basic nav from above and adds the{" "}
                <code>.nav-tabs</code> class to generate a tabbed interface.
              </p>
              <Tab.Container defaultActiveKey="firstTabs4">
                {/* <Nav> */}
                <Nav
                  variant="tabs"
                  id="nav-tab"
                  role="tablist"
                >
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="firstTabs4"
                      variant=" d-flex align-items-center"
                      id="nav-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-home"
                      type="button"
                      role="tab"
                      aria-controls="nav-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="secondTabs4"
                      variant=""
                      id="nav-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-profile"
                      type="button"
                      role="tab"
                      aria-controls="nav-profile"
                      aria-selected="true"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="thirdTabs4"
                      variant=""
                      id="nav-contact-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-contact"
                      type="button"
                      role="tab"
                      aria-controls="nav-contact"
                      aria-selected="true"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                {/* </Nav> */}
                <Tab.Content>
                  <Tab.Pane
                    eventKey="firstTabs4"
                    id="nav-home"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-profile"
                    eventKey="secondTabs4"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    className="fade show"
                    id="nav-contact"
                    eventKey="thirdTabs4"
                    role="tabpanel"
                    aria-labelledby="nav-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Tabs Fill and Justify</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>Force your <code>.nav</code>’s contents to extend the full available width one of two modifier classes. To proportionately fill all available space with your <code>.nav-item</code>s, use <code>.nav-fill</code>. Notice that all horizontal space is occupied, but not every nav item has the same width.</p>
              <Tab.Container defaultActiveKey="firstFill">
                <Nav
                  as="ul"
                  variant="pills"
                  className="mb-3 nav-fill"
                  id="pills-tab-1"
                  role="tablist"
                >
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="firstFill"
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#pills-home-fill"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="secondFill"
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#pills-profile-fill"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="false"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="nav-item">
                    <Nav.Link
                      eventKey="thirdFill"
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#pills-contact-fill"
                      role="tab"
                      aria-controls="pills-contact"
                      aria-selected="false"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content
                  className="tab-content"
                  id="pills-tabContent-1"
                >
                  <Tab.Pane
                    eventKey="firstFill"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab-fill"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="secondFill"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab-fill"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    eventKey="thirdFill"
                    role="tabpanel"
                    aria-labelledby="pills-contact-tab-fill"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Tabs Justify Right</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Right-aligned with <code>.justify-content-end</code>.
              </p>
              <Tab.Container defaultActiveKey="firstRight">
                {/* <Nav> */}
                <Nav
                  variant="tabs"
                  className="justify-content-end"
                  id="nav-tab"
                  role="tablist"
                  as={"ul"}
                >
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="firstRight"
                      variant=" d-flex align-items-center"
                      id="nav-home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-home"
                      type="button"
                      role="tab"
                      aria-controls="nav-home"
                      aria-selected="true"
                    >
                      Home
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="secondRight"
                      variant=""
                      id="nav-profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-profile"
                      type="button"
                      role="tab"
                      aria-controls="nav-profile"
                      aria-selected="false"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as={"li"}>
                    <Nav.Link
                      eventKey="thirdRight"
                      variant=""
                      id="nav-contact-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-contact"
                      type="button"
                      role="tab"
                      aria-controls="nav-contact"
                      aria-selected="false"
                    >
                      Contact
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                {/* </Nav> */}
                <Tab.Content>
                  <Tab.Pane
                    eventKey="firstRight"
                    id="nav-home"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-profile"
                    eventKey="secondRight"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                  <Tab.Pane
                    id="nav-contact"
                    eventKey="thirdRight"
                    role="tabpanel"
                    aria-labelledby="nav-contact-tab"
                  >
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s,
                      when an unknown printer took a galley of type and
                      scrambled it to make a type specimen book.
                    </p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Tabs;