import React, { useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";


const EditTable = () => {
    const data = [
        {
            id: 1,
            Name: "Gio Metric",
            Age: "25",
            Company: "Deepends",
            Country: "Spain",
            City: "Madrid",
        },
        {
            id: 2,
            Name: "Manny Petty",
            Age: "45",
            Company: "Insectus",
            Country: "France",
            City: "San Francisco",
        },
        {
            id: 3,
            Name: "Lucy Tania",
            Age: "26",
            Company: "Isotronic",
            Country: "Germany",
            City: "Frankfurt am Main",
        },
        {
            id: 4,
            Name: "Anna Mull",
            Age: "35",
            Company: "Portica",
            Country: "USA",
            City: "Oregon",
        },
    ];


    const [Add, setAdd] = useState(data);
    const [addFormData] = useState({
        id: "",
        Name: "",
        Age: "",
        Company: "",
        Country: "",
        City: "",
    });

    const addNewValue = () => {
        setAdd(Add.concat(data[3]))
    }

    const handleAddFormChanges = (event) => {
        event.preventDefault();
        const id = event.target.closest("tr").getAttribute("dataid");
        const tdElem = event.target.closest("tr").querySelectorAll("td");
        const obj = {
            id: Number(id),
        };
        Array.from(tdElem, (elem) => {
            if (elem.getAttribute("name") !== null) {
                obj[elem.getAttribute("name")] = elem.innerText;
            }
            return null;
        });
        const newArrIndex = Add.findIndex((item) => {
            if (item.id === Number(id)) {
                return item;
            } else {
                return null;
            }
        });
        Add[newArrIndex] = obj;
        setAdd(Add);
    };


    const handleDeleteClick = (addId) => {
        const newContacts = [...Add];
        const index = Add.findIndex((adds) => adds.id === addId);
        newContacts.splice(index, 1);
        setAdd(newContacts);
    };

    const moveRowUp = (index) => {
        if (index > 0) {
            const newAdd = [...Add];
            const temp = newAdd[index];
            newAdd[index] = newAdd[index - 1];
            newAdd[index - 1] = temp;
            setAdd(newAdd);
        }
    };

    const moveRowDown = (index) => {
        if (index < Add.length - 1) {
            const newAdd = [...Add];
            const temp = newAdd[index];
            newAdd[index] = newAdd[index + 1];
            newAdd[index + 1] = temp;
            setAdd(newAdd);
        }
    };

    return (
        <>
            <Row>
                <Col sm="12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Editable Table</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div id="table" className="table-editable ">
                                <span className="table-add float-end mb-3 me-2">
                                    <button className="btn btn-sm btn-success-subtle"><i
                                        className="ri-add-fill" onClick={addNewValue}><span className="ps-1">Add New</span></i>
                                    </button>
                                </span>
                                {/* <div className='table-responsive w-100'>
                                    <Table striped bordered className="table  text-center">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Age</th>
                                                <th>Company Name</th>
                                                <th>Country</th>
                                                <th>City</th>
                                                <th>Sort</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Add.map((adds, props, index) => (
                                                <tr  key={props} dataid={adds.id}>
                                                    <td
                                                        name="Name"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Name}
                                                    </td>
                                                    <td
                                                        name="Age"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Age}
                                                    </td>
                                                    <td
                                                        name="Company"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Company}
                                                    </td>
                                                    <td
                                                        name="Country"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Country}
                                                    </td>
                                                    <td
                                                        name="City"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.City}
                                                    </td>
                                                    <td>
                                                        <span className="table-up"><a href="#!" className="indigo-text" onClick={() => moveRowUp(props)}><i
                                                            className="fa fa-long-arrow-up" aria-hidden="true"></i></a></span>{" "}
                                                        <span className="table-down"><a href="#!" className="indigo-text" onClick={() => moveRowDown(props)}><i
                                                            className="fa fa-long-arrow-down" aria-hidden="true"></i></a></span>
                                                    </td>
                                                    <td>
                                                        <span className="table-remove">
                                                            <Button
                                                                onClick={() => handleDeleteClick(adds.id)}
                                                                className="btn btn-danger-subtle btn-rounded btn-sm my-0 border-0"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div> */}
                                <div className="table-responsive w-100">
                                    <table className="table table-bordered table-striped text-center">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Age</th>
                                                <th>Company Name</th>
                                                <th>Country</th>
                                                <th>City</th>
                                                <th>Sort</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Add.map((adds, props, index) => (
                                                <tr  key={props} dataid={adds.id}>
                                                    <td
                                                        name="Name"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Name}
                                                    </td>
                                                    <td
                                                        name="Age"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Age}
                                                    </td>
                                                    <td
                                                        name="Company"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Company}
                                                    </td>
                                                    <td
                                                        name="Country"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.Country}
                                                    </td>
                                                    <td
                                                        name="City"
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={handleAddFormChanges}
                                                    >
                                                        {adds.City}
                                                    </td>
                                                    <td>
                                                        <span className="table-up"><a href="#!" className="indigo-text" onClick={() => moveRowUp(props)}><i
                                                            className="fa fa-long-arrow-up" aria-hidden="true"></i></a></span>{" "}
                                                        <span className="table-down"><a href="#!" className="indigo-text" onClick={() => moveRowDown(props)}><i
                                                            className="fa fa-long-arrow-down" aria-hidden="true"></i></a></span>
                                                    </td>
                                                    <td>
                                                        <span className="table-remove">
                                                            <button
                                                                onClick={() => handleDeleteClick(adds.id)}
                                                                className="btn-danger-subtle btn btn-rounded btn-sm my-0"
                                                            >
                                                                Remove
                                                            </button>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row >
        </>
    )
}

export default EditTable