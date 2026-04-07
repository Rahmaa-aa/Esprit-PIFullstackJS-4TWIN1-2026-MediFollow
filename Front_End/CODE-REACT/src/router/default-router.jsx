
import DefaultLayout from "../layouts/defaultLayout"
import Index from "../views"

// Dashboard Page
import HospitalDashboardOne from "../views/dashboard-pages/hospital-dashboard-one"
import HospitalDashboardTwo from "../views/dashboard-pages/hospital-dashboard-two"
import PatientDashboard from "../views/dashboard-pages/patient-dashboard"
import PatientMedicationHistory from "../views/dashboard-pages/patient-medication-history"
import PatientVitalsHistory from "../views/dashboard-pages/patient-vitals-history"
import PatientAppointmentRequest from "../views/dashboard-pages/patient-appointment-request"
import PatientQuestionnairesPage from "../views/dashboard-pages/patient-questionnaires"
import PatientLabAnalysisPage from "../views/dashboard-pages/patient-lab-analysis"
import NurseDashboard from "../views/dashboard-pages/nurse-dashboard"
import CareCoordinatorDashboard from "../views/dashboard-pages/care-coordinator-dashboard"
import CareCoordinatorPatients from "../views/dashboard-pages/care-coordinator-patients"
import CareCoordinatorPatientDetail from "../views/dashboard-pages/care-coordinator-patient-detail"
import CareCoordinatorAppointments from "../views/dashboard-pages/care-coordinator-appointments"
import CareCoordinatorCommunication from "../views/dashboard-pages/care-coordinator-communication"
import Covid19Dashboard from "../views/dashboard-pages/covid-19-dashboard"

// Email Page
import Inbox from "../views/email/inbox"
import EmailCompose from "../views/email/email-compose"

// Doctor Page
import AddDoctor from "../views/doctor/add-doctor"
import DoctorList from "../views/doctor/doctor-list"
import DoctorProfile from "../views/doctor/doctor-profile"
import EditDoctor from "../views/doctor/edit-doctor"
import DoctorPrescriptions from "../views/doctor/doctor-prescriptions"
import DoctorMyPatients from "../views/doctor/doctor-my-patients"
import DoctorPatientDossierPage from "../views/doctor/doctor-patient-dossier"
import DoctorDepartmentNurses from "../views/doctor/doctor-department-nurses"
import DoctorDepartmentDoctors from "../views/doctor/doctor-department-doctors"
import DoctorAvailabilityCalendar from "../views/doctor/doctor-availability-calendar"
import DoctorNurseEscalations from "../views/doctor/doctor-nurse-escalations"
import DoctorBrainMri from "../views/doctor/doctor-brain-mri"
import PatientBrainMri from "../views/patient/patient-brain-mri"

// Patient Page
import AddPatient from "../views/patient/add-patient"
import PatientList from "../views/patient/patient-list"
import PatientProfile from "../views/patient/patient-profile"
import EditPatient from "../views/patient/edit-patient"

// Nurse Page
import AddNurse from "../views/nurse/add-nurse"
import NurseList from "../views/nurse/nurse-list"
import NurseProfile from "../views/nurse/nurse-profile"
import EditNurse from "../views/nurse/edit-nurse"

// Calendar Page
import Calendar from "../views/calendar/calendar"

// Chat Page
import Chat from "../views/chat/chat"
import NotificationsCenterPage from "../views/notifications/notifications-center"

// UI Elements
import Alerts from "../views/ui-elements/alerts";
import Badges from "../views/ui-elements/badges";
import Breadcrumb from "../views/ui-elements/breadcrumb";
import Buttons from "../views/ui-elements/buttons";
import Cards from "../views/ui-elements/cards";
import Carousels from "../views/ui-elements/carousel";
import Colors from "../views/ui-elements/colors";
import Grid from "../views/ui-elements/grid";
import Images from "../views/ui-elements/images";
import ListGroups from "../views/ui-elements/listGroup";
import Modals from "../views/ui-elements/modal";
import Notification from "../views/ui-elements/notification";
import Paginations from "../views/ui-elements/pagination";
import Popovers from "../views/ui-elements/popovers";
import Progressbars from "../views/ui-elements/progressbars";
import Tabs from "../views/ui-elements/tabs";
import Tooltips from "../views/ui-elements/tooltips";
import Typography from "../views/ui-elements/typography";
import Video from "../views/ui-elements/video";

// Form Page
import FormCheckbox from "../views/forms/form-checkbox"
import FormElements from "../views/forms/form-elements"
import FormRadio from "../views/forms/form-radio"
import FormSwitch from "../views/forms/form-switch"
import FormValidatioins from "../views/forms/form-validations"

// Wizard Page
import SimpalWizard from "../views/wizard/simple-wizard"
import ValidteWizard from "../views/wizard/validate-wizard"
import VerticalWizard from "../views/wizard/vertical-wizard"

// Table Page
import BasicTable from "../views/tables/basic-table"
import DataTable from "../views/tables/data-table"
import EditTable from "../views/tables/editable-table"

// Charts Page
import ApexChart from "../views/charts/apex-chart"
import ChartAm from "../views/charts/chart-am"
import ChartPage from "../views/charts/chart-page"
import EChart from "../views/charts/e-chart"

// Icons Page
import Dripicons from "../views/icons/dripicons"
import FontAwsomeFive from "../views/icons/fontawesome-Five"
import Lineawesome from "../views/icons/line-awesome"
import Remixicon from "../views/icons/remixicon"
import Unicons from "../views/icons/unicons"

// Maps 
import GoogleMap from "../views/maps/google-map"

// Extra Page
import AccountSetting from "../views/extra-pages/account-setting"
import AdminDashboard from "../views/extra-pages/admin-dashboard"
import AdminProfile from "../views/admin/admin-profile"
import AdminEditProfile from "../views/admin/admin-edit-profile"
import AdminDepartments from "../views/admin/admin-departments"
import AdminDepartmentDetail from "../views/admin/admin-department-detail"
import AdminAppointmentRequests from "../views/admin/admin-appointment-requests"
import AdminQuestionnaireBank from "../views/admin/admin-questionnaire-bank"
import SuperAdminDashboard from "../views/super-admin/super-admin-dashboard"
import UserList from "../views/super-admin/user-list"
import AuditorList from "../views/super-admin/auditor-list"
import AddAuditor from "../views/super-admin/add-auditor"
import EditAuditor from "../views/super-admin/edit-auditor"
import ViewAuditor from "../views/super-admin/view-auditor"
import CareCoordinatorList from "../views/super-admin/care-coordinator-list"
import AddCareCoordinator from "../views/super-admin/add-care-coordinator"
import EditCareCoordinator from "../views/super-admin/edit-care-coordinator"
import ViewCareCoordinator from "../views/super-admin/view-care-coordinator"
import SuperAdminProfile from "../views/super-admin/super-admin-profile"
import AuditorDashboard from "../views/auditor/auditor-dashboard"
import AuditorLogsPage from "../views/auditor/auditor-logs"
import AuditorSessionGuard from "../components/routing/auditor-session-guard"
import CommingSoon from "../views/extra-pages/pages-comingsoon"
import Error404 from "../views/extra-pages/pages-error-404"
import Error500 from "../views/extra-pages/pages-error-500"
import Faq from "../views/extra-pages/pages-faq"
import Invoice from "../views/extra-pages/pages-invoice"
import Maintenance from "../views/extra-pages/pages-maintenance"
import PricingOne from "../views/extra-pages/pages-pricing-one"
import Pricing from "../views/extra-pages/pages-pricing"
import Timeline from "../views/extra-pages/pages-timeline"
import PrivacyPolicy from "../views/extra-pages/privacy-policy"
import PrivacySetting from "../views/extra-pages/privacy-setting"
import TermsOfService from "../views/extra-pages/terms-of-service"
import BlankLayout from "../layouts/blank-layout"
import Home from "../views/home"
import About from "../views/about"
import Features from "../views/features"
import Contact from "../views/contact"
import SignIn from "../views/auth/sign-in"
import ConformMail from "../views/auth/confirm-mail"
import SignUp from "../views/auth/sign-up"
import RecoverPassword from "../views/auth/recover-password"
import LockScreen from "../views/auth/lock-screen"
import ConfirmLogin from "../views/auth/confirm-login"
export const DefaultRoute = [
  {
    path: "",
    element: <DefaultLayout />,
    children: [
      //  ------ Dashboard Route ------ 
      {
        path: '/dashboard',
        element: <Index />
      },
      {
        path: '/dashboard-pages/dashboard-1',
        element: <HospitalDashboardOne />
      },
      {
        path: '/dashboard-pages/dashboard-2',
        element: <HospitalDashboardTwo />
      },
      {
        path: '/dashboard-pages/patient-dashboard',
        element: <PatientDashboard />
      },
      {
        path: '/dashboard-pages/patient-medication-history',
        element: <PatientMedicationHistory />
      },
      {
        path: '/dashboard-pages/patient-vitals-history',
        element: <PatientVitalsHistory />
      },
      {
        path: '/dashboard-pages/patient-appointment-request',
        element: <PatientAppointmentRequest />
      },
      {
        path: '/dashboard-pages/patient-questionnaires',
        element: <PatientQuestionnairesPage />
      },
      {
        path: '/dashboard-pages/patient-lab-analysis',
        element: <PatientLabAnalysisPage />
      },
      {
        path: '/dashboard-pages/patient-brain-mri',
        element: <PatientBrainMri />
      },
      {
        path: '/dashboard-pages/nurse-dashboard',
        element: <NurseDashboard />
      },
      {
        path: '/dashboard-pages/care-coordinator-dashboard',
        element: <CareCoordinatorDashboard />
      },
      {
        path: '/dashboard-pages/care-coordinator-patients',
        element: <CareCoordinatorPatients />
      },
      {
        path: '/dashboard-pages/care-coordinator-patient/:patientId',
        element: <CareCoordinatorPatientDetail />
      },
      {
        path: '/dashboard-pages/care-coordinator-appointments',
        element: <CareCoordinatorAppointments />
      },
      {
        path: '/dashboard-pages/care-coordinator-communication',
        element: <CareCoordinatorCommunication />
      },
      {
        path: '/dashboard-pages/dashboard-4',
        element: <Covid19Dashboard />
      },

      //  ------ Email Route ------ 
      {
        path: '/email/inbox',
        element: <Inbox />
      },
      {
        path: '/email/email-compose',
        element: <EmailCompose />
      },
      {
        path: '/email/email-compose/:draftMessageId',
        element: <EmailCompose />
      },

      //  ------ Doctor Route ------ 
      {
        path: '/doctor/doctor-list',
        element: <DoctorList />
      },
      {
        path: '/doctor/add-doctor',
        element: <AddDoctor />
      },
      {
        path: '/doctor/doctor-profile',
        element: <DoctorProfile />
      },
      {
        path: '/doctor/doctor-profile/:id',
        element: <DoctorProfile />
      },
      {
        path: '/doctor/edit-doctor/:id',
        element: <EditDoctor />
      },
      {
        path: '/doctor/prescriptions',
        element: <DoctorPrescriptions />
      },
      {
        path: '/doctor/availability-calendar',
        element: <DoctorAvailabilityCalendar />
      },
      {
        path: '/doctor/brain-mri',
        element: <DoctorBrainMri />
      },
      {
        path: '/doctor/my-patients',
        element: <DoctorMyPatients />
      },
      {
        path: '/doctor/urgent-nurse-escalations',
        element: <DoctorNurseEscalations />
      },
      {
        path: '/doctor/my-patients/:patientId',
        element: <DoctorPatientDossierPage />
      },
      {
        path: '/doctor/department-nurses',
        element: <DoctorDepartmentNurses />
      },
      {
        path: '/doctor/department-doctors',
        element: <DoctorDepartmentDoctors />
      },

      //  ------ Patient Route ------
      {
        path: '/patient/patient-list',
        element: <PatientList />
      },
      {
        path: '/patient/add-patient',
        element: <AddPatient />
      },
      {
        path: '/patient/patient-profile',
        element: <PatientProfile />
      },
      {
        path: '/patient/patient-profile/:id',
        element: <PatientProfile />
      },
      {
        path: '/patient/edit-patient/:id',
        element: <EditPatient />
      },

      //  ------ Nurse Route ------
      {
        path: '/nurse/nurse-list',
        element: <NurseList />
      },
      {
        path: '/nurse/add-nurse',
        element: <AddNurse />
      },
      {
        path: '/nurse/nurse-profile',
        element: <NurseProfile />
      },
      {
        path: '/nurse/nurse-profile/:id',
        element: <NurseProfile />
      },
      {
        path: '/nurse/edit-nurse/:id',
        element: <EditNurse />
      },

      //  ------ Calendar Route ------ 
      {
        path: '/calendar',
        element: <Calendar />
      },

      //  ------ Chat Route ------ 
      {
        path: '/chat',
        element: <Chat />
      },
      {
        path: '/notifications',
        element: <NotificationsCenterPage />
      },

      //  ------ UI Elements Route ------ 
      {
        path: "/ui-elements/alerts",
        element: <Alerts />,
      },
      {
        path: "/ui-elements/badges",
        element: <Badges />,
      },
      {
        path: "/ui-elements/breadcrumb",
        element: <Breadcrumb />,
      },
      {
        path: "/ui-elements/buttons",
        element: <Buttons />,
      },
      {
        path: "/ui-elements/cards",
        element: <Cards />,
      },
      {
        path: "/ui-elements/carousel",
        element: <Carousels />,
      },
      {
        path: "/ui-elements/colors",
        element: <Colors />,
      },
      {
        path: "/ui-elements/grid",
        element: <Grid />,
      },
      {
        path: "/ui-elements/images",
        element: <Images />,
      },
      {
        path: "/ui-elements/list-group",
        element: <ListGroups />,
      },
      {
        path: "/ui-elements/modal",
        element: <Modals />,
      },
      {
        path: "/ui-elements/notifications",
        element: <Notification />,
      },
      {
        path: "/ui-elements/pagination",
        element: <Paginations />,
      },
      {
        path: "/ui-elements/popovers",
        element: <Popovers />,
      },
      {
        path: "/ui-elements/progressbars",
        element: <Progressbars />,
      },
      {
        path: "/ui-elements/tabs",
        element: <Tabs />,
      },
      {
        path: "/ui-elements/tooltips",
        element: <Tooltips />,
      },
      {
        path: "/ui-elements/typography",
        element: <Typography />,
      },
      {
        path: "/ui-elements/video",
        element: <Video />,
      },

      //  ------ Form Route ------
      {
        path: '/forms/form-elements',
        element: <FormElements />
      },

      {
        path: '/forms/form-validations',
        element: <FormValidatioins />
      },

      {
        path: '/forms/form-switch',
        element: <FormSwitch />
      },

      {
        path: '/forms/form-checkbox',
        element: <FormCheckbox />
      },

      {
        path: '/forms/form-radio',
        element: <FormRadio />
      },

      //  ------ Wizard Route ------ 
      {
        path: '/wizard/simple-wizard',
        element: <SimpalWizard />
      },
      {
        path: '/wizard/validate-wizard',
        element: <ValidteWizard />
      },
      {
        path: '/wizard/vertical-wizard',
        element: <VerticalWizard />
      },

      //  ------ Table Route ------ 
      {
        path: '/tables/basic-table',
        element: <BasicTable />
      },
      {
        path: '/tables/data-table',
        element: <DataTable />
      },
      {
        path: '/tables/editable-table',
        element: <EditTable />
      },

      //  ------ Chart Route ------ 
      {
        path: '/charts/chart-page',
        element: <ChartPage />
      },
      {
        path: '/charts/e-chart',
        element: <EChart />
      },
      {
        path: '/charts/chart-am',
        element: <ChartAm />
      },
      {
        path: '/charts/apex-chart',
        element: <ApexChart />
      },

      //  ------ Icons Route ------ 
      {
        path: '/icons/dripicons',
        element: <Dripicons />
      },
      {
        path: '/icons/fontawesome-5',
        element: <FontAwsomeFive />
      },
      {
        path: '/icons/line-awesome',
        element: <Lineawesome />
      },
      {
        path: '/icons/remixicon',
        element: <Remixicon />
      },
      {
        path: '/icons/unicons',
        element: <Unicons />
      },

      //  ------ Map Route ------ 
      {
        path: '/maps/google-map',
        element: <GoogleMap />
      },

      //  ------ ExtraPage Route ------ 
      {
        path: '/extra-pages/pages-timeline',
        element: <Timeline />
      },
      {
        path: '/extra-pages/pages-invoice',
        element: <Invoice />
      },
      {
        path: '/extra-pages/blank-page',
        element: <AdminDashboard />
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />
      },
      {
        path: '/admin/profile',
        element: <AdminProfile />
      },
      {
        path: '/admin/edit-profile',
        element: <AdminEditProfile />
      },
      {
        path: '/admin/departments',
        element: <AdminDepartments />
      },
      {
        path: '/admin/departments/:departmentName',
        element: <AdminDepartmentDetail />
      },
      {
        path: '/admin/appointment-requests',
        element: <AdminAppointmentRequests />
      },
      {
        path: '/admin/questionnaire-bank',
        element: <AdminQuestionnaireBank />
      },

      //  ------ Super Admin Routes ------
      {
        path: '/super-admin/dashboard',
        element: <SuperAdminDashboard />
      },
      {
        path: '/super-admin/users',
        element: <UserList />
      },
      {
        path: '/super-admin/auditors',
        element: <AuditorList />
      },
      {
        path: '/super-admin/auditors/add',
        element: <AddAuditor />
      },
      {
        path: '/super-admin/auditors/edit/:id',
        element: <EditAuditor />
      },
      {
        path: '/super-admin/auditors/:id',
        element: <ViewAuditor />
      },
      {
        path: '/super-admin/care-coordinators',
        element: <CareCoordinatorList />
      },
      {
        path: '/super-admin/care-coordinators/add',
        element: <AddCareCoordinator />
      },
      {
        path: '/super-admin/care-coordinators/edit/:id',
        element: <EditCareCoordinator />
      },
      {
        path: '/super-admin/care-coordinators/:id',
        element: <ViewCareCoordinator />
      },
      {
        path: '/super-admin/profile',
        element: <SuperAdminProfile />
      },
      {
        path: '/super-admin/departments',
        element: <AdminDepartments />
      },
      {
        path: '/super-admin/departments/:departmentName',
        element: <AdminDepartmentDetail />
      },
      {
        path: '/auditor/dashboard',
        element: (
          <AuditorSessionGuard>
            <AuditorDashboard />
          </AuditorSessionGuard>
        )
      },
      {
        path: '/auditor/logs',
        element: (
          <AuditorSessionGuard>
            <AuditorLogsPage />
          </AuditorSessionGuard>
        )
      },
      {
        path: '/extra-pages/pages-pricing',
        element: <Pricing />
      },
      {
        path: '/extra-pages/pages-pricing-one',
        element: <PricingOne />
      },
      {
        path: '/extra-pages/pages-faq',
        element: <Faq />
      },
      {
        path: '/extra-pages/privacy-policy',
        element: <PrivacyPolicy />
      },
      {
        path: '/extra-pages/terms-of-use',
        element: <TermsOfService />
      },
      {
        path: '/extra-pages/account-setting',
        element: <AccountSetting />
      },
      {
        path: '/extra-pages/privacy-setting',
        element: <PrivacySetting />
      }
    ]
  }
]

export const BlankLayoutRouter = [
  {
    path: "",
    element: <BlankLayout />,
    children: [
      //  ------ Home Route ------ 
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/features',
        element: <Features />
      },
      {
        path: '/contact',
        element: <Contact />
      },
      //  ------ Auth Route ------ 
      {
        path: '/auth/sign-in',
        element: <SignIn />
      },
      {
        path: '/auth/sign-up',
        element: <SignUp />
      },
      {
        path: '/auth/recover-password',
        element: <RecoverPassword />
      },
      {
        path: '/auth/confirm-mail',
        element: <ConformMail />
      },
      {
        path: '/auth/lock-screen',
        element: <LockScreen />
      },
      {
        path: '/auth/confirm-login',
        element: <ConfirmLogin />
      },

      //  ------ Extra Page Route ------ 
      {
        path: '/extra-pages/pages-error-404',
        element: <Error404 />
      },
      {
        path: '/extra-pages/pages-error-500',
        element: <Error500 />
      },
      {
        path: '/extra-pages/pages-maintenance',
        element: <Maintenance />
      },
      {
        path: '/extra-pages/pages-comingsoon',
        element: <CommingSoon />
      },
    ]
  }

]