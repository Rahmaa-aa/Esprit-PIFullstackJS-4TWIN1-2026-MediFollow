import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Row,
  Col,
  Form,
  Carousel,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const img = (name) => generatePath(`/assets/images/hospital/${name}`);

const Home = () => {
  const [expanded, setExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Load hospital template CSS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = generatePath("/hospital/css/style.css");
    link.id = "hospital-template-css";
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById("hospital-template-css");
      if (el) el.remove();
    };
  }, []);

  // Back to top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const services = [
    { icon: "fa-user-md", title: "Emergency Care", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
    { icon: "fa-procedures", title: "Operation & Surgery", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
    { icon: "fa-stethoscope", title: "Outdoor Checkup", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
    { icon: "fa-ambulance", title: "Ambulance Service", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
    { icon: "fa-pills", title: "Medicine & Pharmacy", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
    { icon: "fa-microscope", title: "Blood Testing", desc: "Kasd dolor no lorem nonumy sit labore tempor at justo rebum rebum stet, justo elitr dolor amet sit" },
  ];

  const pricePlans = [
    { img: "price-1.jpg", title: "Pregnancy Care", price: 49 },
    { img: "price-2.jpg", title: "Health Checkup", price: 99 },
    { img: "price-3.jpg", title: "Dental Care", price: 149 },
    { img: "price-4.jpg", title: "Operation & Surgery", price: 199 },
  ];

  const testimonials = [
    { img: "testimonial-1.jpg", text: "Dolores sed duo clita tempor justo dolor et stet lorem kasd labore dolore lorem ipsum. At lorem lorem magna ut et, nonumy et labore et tempor diam tempor erat. Erat dolor rebum sit ipsum.", name: "Patient Name", role: "Profession" },
    { img: "testimonial-2.jpg", text: "Dolores sed duo clita tempor justo dolor et stet lorem kasd labore dolore lorem ipsum. At lorem lorem magna ut et, nonumy et labore et tempor diam tempor erat. Erat dolor rebum sit ipsum.", name: "Patient Name", role: "Profession" },
    { img: "testimonial-3.jpg", text: "Dolores sed duo clita tempor justo dolor et stet lorem kasd labore dolore lorem ipsum. At lorem lorem magna ut et, nonumy et labore et tempor diam tempor erat. Erat dolor rebum sit ipsum.", name: "Patient Name", role: "Profession" },
  ];

  const blogPosts = [
    { img: "blog-1.jpg", title: "Dolor clita vero elitr sea stet dolor justo diam", desc: "Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna rebum clita rebum dolor stet amet justo" },
    { img: "blog-2.jpg", title: "Dolor clita vero elitr sea stet dolor justo diam", desc: "Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna rebum clita rebum dolor stet amet justo" },
    { img: "blog-3.jpg", title: "Dolor clita vero elitr sea stet dolor justo diam", desc: "Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna rebum clita rebum dolor stet amet justo" },
  ];

  return (
    <div className="hospital-home">
      {/* Topbar */}
      <div className="container-fluid py-2 border-bottom d-none d-lg-block">
        <Container>
          <Row>
            <Col md={6} className="text-center text-lg-start mb-2 mb-lg-0">
              <div className="d-inline-flex align-items-center">
                <a className="text-decoration-none text-body pe-3" href="tel:+0123456789">
                  <i className="bi bi-telephone me-2"></i>+012 345 6789
                </a>
                <span className="text-body">|</span>
                <a className="text-decoration-none text-body px-3" href="mailto:info@example.com">
                  <i className="bi bi-envelope me-2"></i>info@example.com
                </a>
              </div>
            </Col>
            <Col md={6} className="text-center text-lg-end">
              <div className="d-inline-flex align-items-center">
                <a className="text-body px-2" href="#"><i className="fab fa-facebook-f"></i></a>
                <a className="text-body px-2" href="#"><i className="fab fa-twitter"></i></a>
                <a className="text-body px-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                <a className="text-body px-2" href="#"><i className="fab fa-instagram"></i></a>
                <a className="text-body ps-2" href="#"><i className="fab fa-youtube"></i></a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Navbar */}
      <div className="container-fluid sticky-top bg-white shadow-sm">
        <Container>
          <Navbar expand="lg" bg="white" variant="light" className="py-3 py-lg-0" expanded={expanded} onToggle={setExpanded}>
            <Navbar.Brand as={Link} to="/">
              <img src={generatePath("/assets/images/logosite.png")} alt="MediFollow" style={{ maxHeight: "45px" }} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarCollapse" />
            <Navbar.Collapse id="navbarCollapse">
              <Nav className="ms-auto py-0">
                <Nav.Link as={Link} to="/" className="active">Home</Nav.Link>
                <Nav.Link href="#about">About</Nav.Link>
                <Nav.Link href="#services">Service</Nav.Link>
                <Nav.Link href="#pricing">Pricing</Nav.Link>
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle as={Nav.Link} className="dropdown-toggle">Pages</Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/dashboard">Dashboard</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/doctor/doctor-list">Doctors</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/auth/sign-in">Sign In</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/auth/sign-up">Sign Up</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Nav.Link href="#contact">Contact</Nav.Link>
                <Nav.Link as={Link} to="/auth/sign-in" className="ms-2">
                  <Button variant="outline-primary" size="sm" className="rounded-pill">Sign In</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/auth/sign-up" className="ms-1">
                  <Button variant="primary" size="sm" className="rounded-pill">Sign Up</Button>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>

      {/* Hero */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header" style={{ backgroundImage: `url(${img("hero.jpg")})`, backgroundPosition: "top right", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
        <Container className="py-5">
          <Row className="justify-content-start">
            <Col lg={8} className="text-center text-lg-start">
              <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-3" style={{ borderColor: "rgba(256, 256, 256, .3) !important" }}>Welcome To MediFollow</h5>
              <h1 className="display-1 text-white mb-md-4">Best Healthcare Solution In Your City</h1>
              <div className="pt-2">
                <Link to="/doctor/doctor-list" className="btn btn-light rounded-pill py-md-3 px-md-5 mx-2">Find Doctor</Link>
                <Link to="/auth/sign-up" className="btn btn-outline-light rounded-pill py-md-3 px-md-5 mx-2">Appointment</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* About */}
      <div id="about" className="container-fluid py-5">
        <Container>
          <Row className="gx-5">
            <Col lg={5} className="mb-5 mb-lg-0" style={{ minHeight: "500px" }}>
              <div className="position-relative h-100">
                <img className="position-absolute w-100 h-100 rounded" src={img("about.jpg")} alt="About" style={{ objectFit: "cover" }} />
              </div>
            </Col>
            <Col lg={7}>
              <div className="mb-4">
                <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">About Us</h5>
                <h1 className="display-4">Best Medical Care For Yourself and Your Family</h1>
              </div>
              <p className="mb-4">Tempor erat elitr at rebum at at clita aliquyam consetetur. Diam dolor diam ipsum et, tempor voluptua sit consetetur sit. Aliquyam diam amet diam et eos sadipscing labore.</p>
              <Row className="g-3 pt-3">
                {["Qualified Doctors", "Emergency Services", "Accurate Testing", "Free Ambulance"].map((title, i) => (
                  <Col key={i} sm={3} className="col-6">
                    <div className="bg-light text-center rounded-circle py-4">
                      <i className={`fa fa-3x fa-${["user-md", "procedures", "microscope", "ambulance"][i]} text-primary mb-3`}></i>
                      <h6 className="mb-0">{title.split(" ")[0]}<small className="d-block text-primary">{title.split(" ")[1]}</small></h6>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Services */}
      <div id="services" className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Services</h5>
            <h1 className="display-4">Excellent Medical Services</h1>
          </div>
          <Row className="g-5">
            {services.map((s, i) => (
              <Col key={i} lg={4} md={6}>
                <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                  <div className="service-icon mb-4">
                    <i className={`fa fa-2x ${s.icon} text-white`}></i>
                  </div>
                  <h4 className="mb-3">{s.title}</h4>
                  <p className="m-0">{s.desc}</p>
                  <Link to="/auth/sign-up" className="btn btn-lg btn-primary rounded-pill"><i className="bi bi-arrow-right"></i></Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Appointment */}
      <div className="container-fluid bg-primary my-5 py-5">
        <Container className="py-5">
          <Row className="gx-5">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="mb-4">
                <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">Appointment</h5>
                <h1 className="display-4 text-white">Make An Appointment For Your Family</h1>
              </div>
              <p className="text-white mb-5">Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd ipsum. Dolor ea et dolore et at sea ea at dolor.</p>
              <Link to="/doctor/doctor-list" className="btn btn-dark rounded-pill py-3 px-5 me-3">Find Doctor</Link>
              <Link to="/auth/sign-up" className="btn btn-outline-dark rounded-pill py-3 px-5">Sign Up</Link>
            </Col>
            <Col lg={6}>
              <div className="bg-white text-center rounded p-5">
                <h1 className="mb-4">Book An Appointment</h1>
                <Form>
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <Form.Select className="bg-light border-0" style={{ height: "55px" }}>
                        <option>Choose Department</option>
                        <option>Department 1</option>
                        <option>Department 2</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Select className="bg-light border-0" style={{ height: "55px" }}>
                        <option>Select Doctor</option>
                        <option>Doctor 1</option>
                        <option>Doctor 2</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Control className="bg-light border-0" placeholder="Your Name" style={{ height: "55px" }} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Control type="email" className="bg-light border-0" placeholder="Your Email" style={{ height: "55px" }} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Control type="date" className="bg-light border-0" style={{ height: "55px" }} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Control type="time" className="bg-light border-0" style={{ height: "55px" }} />
                    </Col>
                    <Col xs={12}>
                      <Button type="submit" variant="primary" className="w-100 py-3">Make An Appointment</Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Pricing */}
      <div id="pricing" className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Medical Packages</h5>
            <h1 className="display-4">Awesome Medical Programs</h1>
          </div>
          <Row className="g-4">
            {pricePlans.map((plan, j) => (
              <Col key={j} lg={3} md={6}>
                <div className="bg-light rounded text-center h-100">
                  <div className="position-relative">
                    <img className="img-fluid rounded-top w-100" src={img(plan.img)} alt={plan.title} style={{ height: "200px", objectFit: "cover" }} />
                    <div className="position-absolute w-100 h-100 top-50 start-50 translate-middle rounded-top d-flex flex-column align-items-center justify-content-center" style={{ background: "rgba(29, 42, 77, .8)" }}>
                      <h3 className="text-white">{plan.title}</h3>
                      <h1 className="display-4 text-white mb-0"><small className="align-top fw-normal" style={{ fontSize: "22px" }}>$</small>{plan.price}<small className="align-bottom fw-normal" style={{ fontSize: "16px" }}>/ Year</small></h1>
                    </div>
                  </div>
                  <div className="text-center py-5">
                    <p className="mb-1">Emergency Medical Treatment</p>
                    <p className="mb-1">Highly Experienced Doctors</p>
                    <p className="mb-1">Highest Success Rate</p>
                    <p className="mb-1">Telephone Service</p>
                    <Link to="/auth/sign-up" className="btn btn-primary rounded-pill py-3 px-5 my-2">Apply Now</Link>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Team */}
      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Our Doctors</h5>
            <h1 className="display-4">Qualified Healthcare Professionals</h1>
          </div>
          <Carousel indicators={false}>
            {[1, 2, 3].map((n) => (
              <Carousel.Item key={n}>
                <Row className="g-0 bg-light rounded overflow-hidden">
                  <Col xs={12} sm={5} className="h-100">
                    <img className="img-fluid h-100 w-100" src={img(`team-${n}.jpg`)} alt="Doctor" style={{ objectFit: "cover", minHeight: "250px" }} />
                  </Col>
                  <Col xs={12} sm={7} className="d-flex flex-column p-4">
                    <div className="mt-auto">
                      <h3>Doctor Name</h3>
                      <h6 className="fw-normal fst-italic text-primary mb-4">Cardiology Specialist</h6>
                      <p className="m-0">Dolor lorem eos dolor duo eirmod sea. Dolor sit magna rebum clita rebum dolor</p>
                    </div>
                    <div className="d-flex mt-auto border-top pt-4">
                      <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#"><i className="fab fa-twitter"></i></a>
                      <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#"><i className="fab fa-facebook-f"></i></a>
                      <a className="btn btn-lg btn-primary btn-lg-square rounded-circle" href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                  </Col>
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </div>

      {/* Search */}
      <div className="container-fluid bg-primary my-5 py-5">
        <Container className="py-5">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">Find A Doctor</h5>
            <h1 className="display-4 text-white mb-4">Find A Healthcare Professionals</h1>
            <p className="text-white fw-normal">Duo ipsum erat stet dolor sea ut nonumy tempor. Tempor duo lorem eos sit sed ipsum takimata ipsum sit est.</p>
          </div>
          <div className="mx-auto" style={{ maxWidth: "600px" }}>
            <div className="input-group">
              <Form.Select className="border-primary" style={{ width: "25%", height: "60px" }}>
                <option>Department</option>
                <option>Department 1</option>
                <option>Department 2</option>
              </Form.Select>
              <Form.Control className="border-primary" placeholder="Keyword" style={{ width: "50%", height: "60px" }} />
              <Button variant="dark" className="border-0" style={{ width: "25%" }}>Search</Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Testimonials */}
      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Testimonial</h5>
            <h1 className="display-4">Patients Say About Our Services</h1>
          </div>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Carousel indicators>
                {testimonials.map((t, i) => (
                  <Carousel.Item key={i}>
                    <div className="testimonial-item text-center">
                      <div className="position-relative mb-5">
                        <img className="img-fluid rounded-circle mx-auto" src={img(t.img)} alt="" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                        <div className="position-absolute top-100 start-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle" style={{ width: "60px", height: "60px" }}>
                          <i className="fa fa-quote-left fa-2x text-primary"></i>
                        </div>
                      </div>
                      <p className="fs-4 fw-normal">{t.text}</p>
                      <hr className="w-25 mx-auto" />
                      <h3>{t.name}</h3>
                      <h6 className="fw-normal text-primary mb-3">{t.role}</h6>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Blog */}
      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">Blog Post</h5>
            <h1 className="display-4">Our Latest Medical Blog Posts</h1>
          </div>
          <Row className="g-5">
            {blogPosts.map((b, i) => (
              <Col key={i} xl={4} lg={6}>
                <div className="bg-light rounded overflow-hidden">
                  <img className="img-fluid w-100" src={img(b.img)} alt="" style={{ height: "220px", objectFit: "cover" }} />
                  <div className="p-4">
                    <a className="h3 d-block mb-3 text-decoration-none text-dark" href="#">{b.title}</a>
                    <p className="m-0">{b.desc}</p>
                  </div>
                  <div className="d-flex justify-content-between border-top p-4">
                    <div className="d-flex align-items-center">
                      <img className="rounded-circle me-2" src={img("user.jpg")} width="25" height="25" alt="" style={{ objectFit: "cover" }} />
                      <small>John Doe</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="ms-3"><i className="far fa-eye text-primary me-1"></i>12345</small>
                      <small className="ms-3"><i className="far fa-comment text-primary me-1"></i>123</small>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <div id="contact" className="container-fluid bg-dark text-light mt-5 py-5">
        <Container className="py-5">
          <Row className="g-5">
            <Col lg={3} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Get In Touch</h4>
              <p className="mb-4">No dolore ipsum accusam no lorem. Invidunt sed clita kasd clita et et dolor sed dolor</p>
              <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-3"></i>123 Street, New York, USA</p>
              <p className="mb-2"><i className="fa fa-envelope text-primary me-3"></i>info@example.com</p>
              <p className="mb-0"><i className="fa fa-phone-alt text-primary me-3"></i>+012 345 67890</p>
            </Col>
            <Col lg={3} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Quick Links</h4>
              <div className="d-flex flex-column">
                <Link to="/" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Home</Link>
                <a href="#about" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>About Us</a>
                <a href="#services" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Our Services</a>
                <Link to="/doctor/doctor-list" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Meet The Team</Link>
                <Link to="/auth/sign-in" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Sign In</Link>
                <Link to="/auth/sign-up" className="text-light text-decoration-none"><i className="fa fa-angle-right me-2"></i>Sign Up</Link>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Popular Links</h4>
              <div className="d-flex flex-column">
                <Link to="/dashboard" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Dashboard</Link>
                <Link to="/doctor/doctor-list" className="text-light mb-2 text-decoration-none"><i className="fa fa-angle-right me-2"></i>Doctors</Link>
                <Link to="/auth/sign-in" className="text-light text-decoration-none"><i className="fa fa-angle-right me-2"></i>Sign In</Link>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Newsletter</h4>
              <Form>
                <div className="input-group">
                  <Form.Control className="p-3 border-0" placeholder="Your Email Address" />
                  <Button variant="primary">Sign Up</Button>
                </div>
              </Form>
              <h6 className="text-primary text-uppercase mt-4 mb-3">Follow Us</h6>
              <div className="d-flex">
                <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-2" href="#"><i className="fab fa-twitter"></i></a>
                <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                <a className="btn btn-lg btn-primary btn-lg-square rounded-circle" href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="container-fluid bg-dark text-light border-top border-secondary py-4">
        <Container>
          <Row>
            <Col md={6} className="text-center text-md-start">
              <p className="mb-md-0">&copy; <Link to="/" className="text-primary text-decoration-none">MediFollow</Link>. All Rights Reserved.</p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <p className="mb-0">Medical & Hospital Admin Template</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Back to Top */}
      {showBackToTop && (
        <Button variant="primary" size="lg" className="btn-lg-square back-to-top rounded-0" onClick={scrollToTop} style={{ position: "fixed", right: "30px", bottom: 0, borderRadius: "50% 50% 0 0", zIndex: 99 }}>
          <i className="bi bi-arrow-up"></i>
        </Button>
      )}
    </div>
  );
};

export default Home;
