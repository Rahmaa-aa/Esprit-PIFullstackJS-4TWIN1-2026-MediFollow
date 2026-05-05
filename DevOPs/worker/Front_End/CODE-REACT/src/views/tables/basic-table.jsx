import React from "react";
import Card from "../../components/Card";
import { Col, Row } from "react-bootstrap";


const BasicTable = () => {
    return (
        <>
            <Row>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Tables</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>The <code>.table </code> class adds basic styling to a table.</p>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Table Head Options</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Similar to tables and dark tables, use the modifier classes <code
                                className="highlighter-rouge">.thead-light</code> or <code
                                    className="highlighter-rouge">.thead-dark</code> to make <code
                                        className="highlighter-rouge">&lt;thead&gt;</code>s appear light or dark gray.</p>
                            <table className="table">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Borderless table</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Add <code className="highlighter-rouge">.table-borderless</code> for a table without borders.</p>
                            <table className="table table-borderless">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p><code className="highlighter-rouge">.table-borderless</code> can also be used on dark tables.</p>
                            <table className="table table-borderless table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Small table</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Add <code className="highlighter-rouge">.table-sm</code> to make tables more compact by cutting cell
                                padding in half.</p>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table table-sm table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Captions</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>A <code className="highlighter-rouge">&lt;caption&gt;</code> functions like a heading for a table. It
                                helps users with screen readers to find a table and understand what it’s about and decide if
                                they want to read it.</p>
                            <table className="table">
                                <caption>List of users</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Table Dark</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>You can also invert the colors—with light text on dark backgrounds—with <code
                                className="highlighter-rouge">.table-dark</code>.</p>
                            <table className="table table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Striped Rows</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Use <code className="highlighter-rouge">.table-striped</code> to add zebra-striping to any table row
                                within the <code className="highlighter-rouge">&lt;tbody&gt;</code>.</p>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table table-striped table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Larry</td>
                                        <td>the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Hoverable rows</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Add <code className="highlighter-rouge">.table-hover</code> to enable a hover state on table rows
                                within a <code className="highlighter-rouge">&lt;tbody&gt;</code>.</p>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table table-hover table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td>Otto</td>
                                        <td>@mdo</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Jacob</td>
                                        <td>Thornton</td>
                                        <td>@fat</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td colSpan="2">Larry the Bird</td>
                                        <td>@twitter</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Contextual classes</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Use contextual classes to color table rows or individual cells.</p>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Class</th>
                                        <th scope="col">Heading</th>
                                        <th scope="col">Heading</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-active">
                                        <th scope="row">Active</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Default</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-primary">
                                        <th scope="row">Primary</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-secondary">
                                        <th scope="row">Secondary</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-success">
                                        <th scope="row">Success</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-danger">
                                        <th scope="row">Danger</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-warning">
                                        <th scope="row">Warning</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-info">
                                        <th scope="row">Info</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p>Regular table background variants are not available with the dark table, however, you may use <a
                                href="https://getbootstrap.com/" target="_blank">text or background utilities</a> to achieve
                                similar styles.</p>
                            <table className="table table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Heading</th>
                                        <th scope="col">Heading</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-primary">
                                        <th scope="row">1</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-success">
                                        <th scope="row">3</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">4</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-info">
                                        <th scope="row">5</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">6</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-warning">
                                        <th scope="row">7</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">8</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                    <tr className="table-danger">
                                        <th scope="row">9</th>
                                        <td>Cell</td>
                                        <td>Cell</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Responsive tables</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Responsive tables allow tables to be scrolled horizontally with ease. Make any table responsive
                                across all viewports by wrapping a <code className="highlighter-rouge">.table</code> with <code
                                    className="highlighter-rouge">.table-responsive</code>. Or, pick a maximum breakpoint with which
                                to have a responsive table up to by using <code
                                    className="highlighter-rouge">.table-responsive{"{-sm|-md|-lg|-xl|-xxl}"}</code>.</p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                            <th scope="col">Heading</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">1</th>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">2</th>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">3</th>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                            <td>Cell</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default BasicTable