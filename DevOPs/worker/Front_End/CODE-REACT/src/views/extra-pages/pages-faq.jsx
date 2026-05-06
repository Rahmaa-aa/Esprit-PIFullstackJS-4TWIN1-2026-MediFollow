import React, { useState } from "react";
import { Accordion } from "react-bootstrap"; 

const Faq = () => {
  const [activeKey, setActiveKey] = useState('0');

  const handleSelect = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <Accordion defaultActiveKey={"0"} activeKey={activeKey} className="accordion-flush custom-accordion iq-faq" id="accordion-1">
        <div className="row">
          <div className="col-lg-6">
            {[
              {
                question: 'It is a long established reader will be?',
                answer:
                  'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for "lorem ipsum" will uncover many web sites still in their infancy.',
                key: '0',
              },
              {
                question: 'Distracted by the readable page whent?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '1',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '2',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '3',
              },
              {
                question: 'The readable content of a page at its layout?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '4',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '5',
              },
            ].map((item) => (
              <Accordion.Item key={item.key} className="card border-0" eventKey={item.key}>
                <div className="accordion-header">
                  <Accordion.Button
                    bsPrefix={`accordion-button fs-4 ${activeKey === item.key ? 'text-primary' : 'text-gray'}`}
                    onClick={() => handleSelect(activeKey === item.key ? null : item.key)}
                    aria-controls={`flush-${item.key}`}
                  >
                    {item.question}
                  </Accordion.Button>
                </div>
                <Accordion.Body className="p-5">
                  <p className="mb-0 fs-5">{item.answer}</p>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </div>
          <div className="col-lg-6">
            {[
              {
                question: 'It is a long established reader will be?',
                answer:
                  'Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for "lorem ipsum" will uncover many web sites still in their infancy.',
                key: '6',
              },
              {
                question: 'Distracted by the readable page whent?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '7',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '8',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '9',
              },
              {
                question: 'The readable content of a page at its layout?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '10',
              },
              {
                question: 'What is user interface kit?',
                answer:
                  'It has survived not only five centuries, but also the leap into electronic typesetting. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
                key: '11',
              },
            ].map((item) => (
              <Accordion.Item key={item.key} className="card border-0" eventKey={item.key}>
                <div className="accordion-header">
                  <Accordion.Button
                    bsPrefix={`accordion-button fs-4 ${activeKey === item.key ? 'text-primary' : 'text-gray'}`}
                    onClick={() => handleSelect(activeKey === item.key ? null : item.key)}
                    aria-controls={`flush-${item.key}`}
                  >
                    {item.question}
                  </Accordion.Button>
                  <Accordion.Body className="p-5">
                    <p className="mb-0 fs-5">{item.answer}</p>
                  </Accordion.Body>
                </div>
              </Accordion.Item>
            ))}
          </div>
        </div>
      </Accordion>
    </>
  );
}

export default Faq;
