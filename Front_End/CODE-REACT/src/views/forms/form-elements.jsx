import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card"

const FormElements = () => {
    return (
        <>
            <Row>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center ">
                            <Card.Header.Title>
                                <h4 className="card-title">Basic Form</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="email" className="mb-0">Email address:</Form.Label>
                                    <Form.Control type="email" className="form-control my-2" id="email1" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="pwd" className="mb-0">Password:</Form.Label>
                                    <Form.Control type="password" className="form-control my-2" id="pwd" />
                                </Form.Group>
                                <Form.Group className="form-group custom-control custom-checkbox mb-3">
                                    <Form.Check.Input type="checkbox" className="custom-control-input" id="basicformCheck" />{" "}
                                    <Form.Check.Label className="custom-control-label" htmlFor="basicformCheck">Remember me</Form.Check.Label>
                                </Form.Group>
                                <button type="submit" className="btn btn-danger-subtle mt-2">Cancel</button>{" "}
                                <button type="submit" className="btn btn-primary-subtle me-1 mt-2">Submit</button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Form Grid</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Row>
                                    <Col>
                                        <Form.Control type="text" className="form-control my-2" placeholder="First name" />
                                    </Col>
                                    <Col>
                                        <Form.Control type="text" className="form-control my-2" placeholder="Last name" />
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Input</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputText1" className="mb-0">Input Text </Form.Label>
                                    <Form.Control type="text" className="form-control my-2" id="exampleInputText1" defaultValue="Mark Jets"
                                        placeholder="Enter Name" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputEmail3" className="mb-0">Email Input</Form.Label>
                                    <Form.Control type="email" className="form-control my-2" id="exampleInputEmail3" defaultValue="markJets@gmail.com"
                                        placeholder="Enter Email" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputurl" className="mb-0">Url Input</Form.Label>
                                    <Form.Control type="url" className="form-control my-2" id="exampleInputurl"
                                        defaultValue="https://getbootstrap.com" placeholder="Enter Url" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputphone" className="mb-0">Telephone Input</Form.Label>
                                    <Form.Control type="tel" className="form-control my-2" id="exampleInputphone" defaultValue="1-(555)-555-5555" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputNumber1" className="mb-0">Number Input</Form.Label>
                                    <Form.Control type="number" className="form-control my-2" id="exampleInputNumber1" defaultValue="2356" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputPassword3" className="mb-0">Password Input</Form.Label>
                                    <Form.Control type="password" className="form-control my-2" id="exampleInputPassword3" defaultValue="markJets123"
                                        placeholder="Enter Password" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputdate" className="mb-0">Date Input</Form.Label>
                                    <Form.Control type="date" className="form-control my-2" id="exampleInputdate" defaultValue="2019-12-18" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputmonth" className="mb-0">Month Input</Form.Label>
                                    <Form.Control type="month" className="form-control my-2" id="exampleInputmonth" defaultValue="2019-12" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputweek" className="mb-0">Week Input</Form.Label>
                                    <Form.Control type="week" className="form-control my-2" id="exampleInputweek" defaultValue="2019-W46" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputtime" className="mb-0">Time Input</Form.Label>
                                    <Form.Control type="time" className="form-control my-2" id="exampleInputtime" defaultValue="13:45" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleInputdatetime" className="mb-0">Date and Time Input</Form.Label>
                                    <Form.Control type="datetime-local" className="form-control my-2" id="exampleInputdatetime"
                                        defaultValue="2019-12-19T13:45:00" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="exampleFormControlTextarea1" className="mb-0">Example textarea</Form.Label>
                                    <Form.Control as="textarea" className="form-control my-2" id="exampleFormControlTextarea1" rows="5"></Form.Control>
                                </Form.Group>
                                <button type="submit" className="btn btn-danger-subtle mt-2">Cancel</button>{" "}
                                <button type="submit" className="btn btn-primary-subtle me-1 mt-2">Submit</button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Input Size</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Form.Group className="form-group" >
                                    <Form.Label htmlFor="colFormLabelSm" className="mb-0">Small</Form.Label>
                                    <Form.Control type="email" className="form-control form-control-sm my-2" id="colFormLabelSm"
                                        placeholder="form-control-sm" />
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="colFormLabel" className="mb-0">Default</Form.Label>
                                    <Form.Control type="email" className="form-control my-2" id="colFormLabel" placeholder="form-control my-2" />
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label htmlFor="colFormLabelLg" className="pb-0 mb-0">Large</Form.Label>
                                    <Form.Control type="email" className="form-control form-control-lg my-2" id="colFormLabelLg"
                                        placeholder="form-control-lg" />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Horizontal Form</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="form-horizontal cust-form-elements">
                                <Row className="form-group align-items-center">
                                    <Col sm={2}>
                                        <Form.Label className="control-label align-self-center mb-0" htmlFor="email">Email:</Form.Label>
                                    </Col>
                                    <Col sm={10}>
                                        <Form.Control type="email" className="form-control my-2" id="email" placeholder="Enter Your  email" />
                                    </Col>
                                </Row>
                                <Row className="form-group align-items-center">
                                    <Col sm={2}>
                                        <Form.Label className="control-label align-self-center mb-0" htmlFor="pwd1">Password:</Form.Label>
                                    </Col>
                                    <Col sm={10}>
                                        <Form.Control type="password" className="form-control my-2" id="pwd1"
                                            placeholder="Enter Your password" />
                                    </Col>
                                </Row>
                                <Form.Group className="form-group">
                                    <div className="custom-control custom-checkbox">
                                        <Form.Check.Input type="checkbox" className="custom-control-input" id="horizontalformCheck" />{" "}
                                        <Form.Check.Label className="custom-control-label" htmlFor="horizontalformCheck">Remember me</Form.Check.Label>
                                    </div>
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <button type="submit" className="btn btn-danger-subtle mt-2">Cancel</button>{" "}
                                    <button type="submit" className="btn btn-primary-subtle me-1 mt-2">Submit</button>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Form row</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Row>
                                    <Col className="mb-4">
                                        <Form.Control type="text" className="form-control my-2" placeholder="First name" />
                                    </Col>
                                    <Col>
                                        <Form.Control type="text" className="form-control my-2" placeholder="Last name" />
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Input</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="form-group cust-form-elements mb-3">
                                <Form.Label htmlFor="exampleInputReadonly">Readonly</Form.Label>
                                <Form.Control type="text" className="form-control" id="exampleInputReadonly" readOnly defaultValue="Mark Jhon" />
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements mb-3">
                                <Form.Label htmlFor="exampleInputcolor">Input Color </Form.Label>
                                <input type="color" className="form-control" id="exampleInputcolor" defaultValue="#0dd6b8" style={{ height: "35px" }} />
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements mb-3">
                                <Form.Label htmlFor="exampleFormControlSelect1">Select Input</Form.Label>
                                <select className="form-select" id="exampleFormControlSelect1">
                                    <option defaultValue="">Select Your Age</option>
                                    <option>0-18</option>
                                    <option>18-26</option>
                                    <option>26-46</option>
                                    <option>46-60</option>
                                    <option>Above 60</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements mb-3">
                                <Form.Label htmlFor="choices-single-default">Select Input New</Form.Label>
                                <select className="form-select" data-trigger="" name="choices-single-default"
                                    id="choices-single-default">
                                    <option defaultValue="">This is a placeholder</option>
                                    <option defaultValue="Choice 1">Choice 1</option>
                                    <option defaultValue="Choice 2">Choice 2</option>
                                    <option defaultValue="Choice 3">Choice 3</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements mb-3">
                                <Form.Label htmlFor="choices-multiple-default">Default</Form.Label>
                                <select className="form-select" data-trigger="" name="choices-multiple-default"
                                    id="choices-multiple-default" multiple defaultValue={["Choice 1"]}>
                                    <option defaultValue="Choice 1">Choice 1</option>
                                    <option defaultValue="Choice 2">Choice 2</option>
                                    <option defaultValue="Choice 3">Choice 3</option>
                                    <option defaultValue="Choice 4" disabled>Choice 4</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label htmlFor="exampleFormControlSelect2">Example Multiple Select</Form.Label>
                                <select multiple className="form-select" id="exampleFormControlSelect2">
                                    <option>select-1</option>
                                    <option>select-2</option>
                                    <option>select-3</option>
                                    <option>select-4</option>
                                    <option>select-5</option>
                                    <option>select-6</option>
                                    <option>select-7</option>
                                    <option>select-8</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label htmlFor="customRange1">Range Input</Form.Label>
                                <Form.Range type="range"  id="customRange1" />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckDefault11" />
                                    <Form.Check.Label htmlFor="flexCheckDefault11">
                                        Default checkbox
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckchecked11" defaultChecked />
                                    <Form.Check.Label htmlFor="flexCheckdedchecked11">
                                        Checked checkbox
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckDisabled" disabled />
                                    <Form.Check.Label htmlFor="flexCheckDisabled">
                                        Disabled checkbox
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckcheckedDisabled"
                                        defaultChecked disabled />
                                    <Form.Check.Label htmlFor="flexCheckcheckedDisabled">
                                        Disabled checked checkbox
                                    </Form.Check.Label>
                                </Form.Check>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                    <Form.Check.Label htmlFor="flexRadioDefault1">
                                        Default radio
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                                        defaultChecked />
                                    <Form.Check.Label htmlFor="flexRadioDefault2">
                                        Default checked radio
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="radio" name="flexRadioDisabled" id="flexRadioDisabled"
                                        disabled />
                                    <Form.Check.Label htmlFor="flexRadioDisabled">
                                        Disabled radio
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="radio" name="flexRadioDisabled"
                                        id="flexRadiocheckedDisabled" defaultChecked disabled />
                                    <Form.Check.Label htmlFor="flexRadiocheckedDisabled">
                                        Disabled checked radio
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="form-radio">
                                    <Form.Check.Input type="radio" id="customRadio5" name="customRadio5" disabled
                                        defaultChecked />
                                    <Form.Check.Label htmlFor="customRadio5"> Selected and disabled radio</Form.Check.Label>
                                </Form.Check>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Check className="d-block">
                                    <Form.Check.Input type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                    <Form.Check.Label htmlFor="flexRadioDefault1">
                                        Default radio
                                    </Form.Check.Label>
                                </Form.Check>
                                <Form.Group className="form-group">
                                    <Form.Check className="d-block">
                                        <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckDefault2" />
                                        <Form.Check.Label htmlFor="flexCheckDefault2">
                                            Default checkbox
                                        </Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check className="d-block">
                                        <Form.Check.Input type="checkbox" defaultValue="" id="checkedcheck" defaultChecked />
                                        <Form.Check.Label htmlFor="checkedcheck">
                                            Checked checkbox
                                        </Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check className="d-block">
                                        <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckDisabled1"
                                            disabled />
                                        <Form.Check.Label htmlFor="flexCheckDisabled1">
                                            Disabled checkbox
                                        </Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check className="d-block">
                                        <Form.Check.Input type="checkbox" defaultValue="" id="flexCheckcheckedDisabled11"
                                            disabled defaultChecked />
                                        <Form.Check.Label htmlFor="flexCheckcheckedDisabled11">
                                            Disabled checked checkbox
                                        </Form.Check.Label>
                                    </Form.Check>
                                </Form.Group>
                                <Form.Check className="custom-control custom-radio custom-control-inline">
                                    <Form.Check.Input type="radio" id="customRadio8" name="customRadio6" className="custom-control-input"
                                        defaultChecked />
                                    <Form.Check.Label className="custom-control-label" htmlFor="customRadio8"> Selected radio</Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="custom-control custom-radio custom-control-inline">
                                    <Form.Check.Input type="radio" id="customRadio9" name="customRadio7" className="custom-control-input"
                                        disabled />
                                    <Form.Check.Label className="custom-control-label" htmlFor="customRadio9"> disabled radio</Form.Check.Label>
                                </Form.Check>
                                <Form.Check className="custom-control custom-radio custom-control-inline">
                                    <Form.Check.Input type="radio" id="customRadio10" name="customRadio8" className="custom-control-input"
                                        disabled defaultChecked />
                                    <Form.Check.Label className="custom-control-label" htmlFor="customRadio10"> Selected and disabled
                                        radio</Form.Check.Label>
                                </Form.Check>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Check className="form-switch">
                                    <Form.Check.Input type="checkbox" id="flexSwitchCheckDefault" />
                                    <Form.Check.Label htmlFor="flexSwitchCheckDefault">Default switch checkbox
                                        input</Form.Check.Label>
                                </Form.Check>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="customFile1" className=" custom-file-input">Choose File</Form.Label>
                                    <Form.Control className="form-control" type="file" id="customFile1" />
                                </Form.Group>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label htmlFor="customFile" className=" custom-file-input">Example File Input</Form.Label>
                                <Form.Control className="form-control" type="file" id="customFile" />
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label htmlFor="customFile2" className=" custom-file-input">Choose File</Form.Label>
                                <Form.Control className="form-control" type="file" id="customFile2" />
                            </Form.Group>
                            <button type="submit" className="btn btn-danger-subtle">Cancel</button>{" "}
                            <button type="submit" className="btn btn-primary-subtle">Submit</button>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title ">Select Size</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label className="mb-0">Small</Form.Label>
                                <select className="form-control form-control-sm my-2">
                                    <option>Open this select menu</option>
                                    <option defaultValue="1">One</option>
                                    <option defaultValue="2">Two</option>
                                    <option defaultValue="3">Three</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label className="mb-0">Default</Form.Label>
                                <select className="form-control my-2">
                                    <option>Open this select menu</option>
                                    <option defaultValue="1">One</option>
                                    <option defaultValue="2">Two</option>
                                    <option defaultValue="3">Three</option>
                                </select>
                            </Form.Group>
                            <Form.Group className="form-group cust-form-elements">
                                <Form.Label className="mb-0">Large</Form.Label>
                                <select className="form-control form-control-lg mt-2">
                                    <option>Open this select menu</option>
                                    <option defaultValue="1">One</option>
                                    <option defaultValue="2">Two</option>
                                    <option defaultValue="3">Three</option>
                                </select>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default FormElements