import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";

const PrivacySetting = () => {
  const { t } = useTranslation();

  return (
    <>
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">{t("privacySetting.pageTitle")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="acc-privacy">
                <div className="data-privacy">
                  <h4 className="mb-2">{t("privacySetting.accountPrivacyTitle")}</h4>
                  <Form.Check>
                    <Form.Check.Input type="checkbox" id="customCheck5" />
                    <Form.Check.Label className="ps-2" htmlFor="customCheck5">
                      {t("privacySetting.privateAccount")}
                    </Form.Check.Label>
                  </Form.Check>
                  <p>{t("privacySetting.accountPrivacyDesc")}</p>
                </div>
                <hr />
                <div className="data-privacy">
                  <h4 className="mb-2">{t("privacySetting.activityTitle")}</h4>
                  <Form.Check>
                    <Form.Check.Input type="checkbox" id="activety" />
                    <Form.Check.Label className="ps-2" htmlFor="activety">
                      {t("privacySetting.showActivityStatus")}
                    </Form.Check.Label>
                  </Form.Check>
                  <p>{t("privacySetting.activityDesc")}</p>
                </div>
                <hr />
                <div className="data-privacy">
                  <h4 className="mb-2">{t("privacySetting.storyTitle")}</h4>
                  <Form.Check>
                    <Form.Check.Input type="checkbox" id="story" />
                    <Form.Check.Label className="ps-2" htmlFor="story">
                      {t("privacySetting.allowSharing")}
                    </Form.Check.Label>
                  </Form.Check>
                  <p>{t("privacySetting.storyDesc")}</p>
                </div>
                <hr />
                <div className="data-privacy">
                  <h4 className="mb-2">{t("privacySetting.loginNotifTitle")}</h4>
                  <Form.Check>
                    <Form.Check.Input type="radio" name="customRadio2" id="enable" />
                    <Form.Check.Label htmlFor="enable" className="ps-2">
                      {t("privacySetting.enable")}
                    </Form.Check.Label>
                  </Form.Check>
                  <Form.Check>
                    <Form.Check.Input type="radio" name="customRadio2" id="disable" />
                    <Form.Check.Label htmlFor="disable" className="ps-2">
                      {t("privacySetting.disable")}
                    </Form.Check.Label>
                  </Form.Check>
                  <p>{t("privacySetting.loginNotifDesc")}</p>
                </div>
                <hr />
                <div className="data-privacy">
                  <h4 className="mb-2">{t("privacySetting.helpTitle")}</h4>
                  <a href="#">
                    <i className="ri-customer-service-2-line me-2" aria-hidden="true" />
                    {t("privacySetting.support")}
                  </a>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PrivacySetting;
