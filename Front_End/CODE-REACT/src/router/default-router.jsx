import { lazy } from "react";
import { Navigate } from "react-router-dom";

/* Charg\u00e9 paresseusement : isole le CSS lourd du dashboard (xray-dashboard, customizer, swiper,
 * phosphor regular) dans un chunk s\u00e9par\u00e9 \u2192 ne bloque plus le rendu de la landing (LCP). */
const DefaultLayout = lazy(() => import("../layouts/defaultLayout"));
import BlankLayout from "../layouts/blank-layout";
import Home from "../views/home";
import About from "../views/about";
import Features from "../views/features";
import Contact from "../views/contact";
import Blog from "../views/landing/blog";
import SignIn from "../views/auth/sign-in";
import ConformMail from "../views/auth/confirm-mail";
import SignUp from "../views/auth/sign-up";
import RecoverPassword from "../views/auth/recover-password";
import LockScreen from "../views/auth/lock-screen";
import ConfirmLogin from "../views/auth/confirm-login";
import AuditorSessionGuard from "../components/routing/auditor-session-guard";

/** Vues app : chargées à la demande pour réduire le JS initial (LCP landing / délai d’affichage). */
const Index = lazy(() => import("../views/index"));
const HospitalDashboardOne = lazy(() => import("../views/dashboard-pages/hospital-dashboard-one"));
const HospitalDashboardTwo = lazy(() => import("../views/dashboard-pages/hospital-dashboard-two"));
const PatientDashboard = lazy(() => import("../views/dashboard-pages/patient-dashboard"));
const PatientMedicationHistory = lazy(() => import("../views/dashboard-pages/patient-medication-history"));
const PatientVitalsHistory = lazy(() => import("../views/dashboard-pages/patient-vitals-history"));
const PatientAppointmentRequest = lazy(() => import("../views/dashboard-pages/patient-appointment-request"));
const PatientQuestionnairesPage = lazy(() => import("../views/dashboard-pages/patient-questionnaires"));
const PatientLabAnalysisPage = lazy(() => import("../views/dashboard-pages/patient-lab-analysis"));
const NurseDashboard = lazy(() => import("../views/dashboard-pages/nurse-dashboard"));
const CareCoordinatorDashboard = lazy(() => import("../views/dashboard-pages/care-coordinator-dashboard"));
const CareCoordinatorPatients = lazy(() => import("../views/dashboard-pages/care-coordinator-patients"));
const CareCoordinatorPatientDetail = lazy(() => import("../views/dashboard-pages/care-coordinator-patient-detail"));
const CareCoordinatorAppointments = lazy(() => import("../views/dashboard-pages/care-coordinator-appointments"));
const CareCoordinatorCommunication = lazy(() => import("../views/dashboard-pages/care-coordinator-communication"));
const Covid19Dashboard = lazy(() => import("../views/dashboard-pages/covid-19-dashboard"));
const Inbox = lazy(() => import("../views/email/inbox"));
const EmailCompose = lazy(() => import("../views/email/email-compose"));
const AddDoctor = lazy(() => import("../views/doctor/add-doctor"));
const DoctorList = lazy(() => import("../views/doctor/doctor-list"));
const DoctorProfile = lazy(() => import("../views/doctor/doctor-profile"));
const EditDoctor = lazy(() => import("../views/doctor/edit-doctor"));
const DoctorPrescriptions = lazy(() => import("../views/doctor/doctor-prescriptions"));
const DoctorMyPatients = lazy(() => import("../views/doctor/doctor-my-patients"));
const DoctorPatientDossierPage = lazy(() => import("../views/doctor/doctor-patient-dossier"));
const DoctorDepartmentNurses = lazy(() => import("../views/doctor/doctor-department-nurses"));
const DoctorDepartmentDoctors = lazy(() => import("../views/doctor/doctor-department-doctors"));
const DoctorAvailabilityCalendar = lazy(() => import("../views/doctor/doctor-availability-calendar"));
const DoctorNurseEscalations = lazy(() => import("../views/doctor/doctor-nurse-escalations"));
const DoctorBrainMri = lazy(() => import("../views/doctor/doctor-brain-mri"));
const PatientBrainMri = lazy(() => import("../views/patient/patient-brain-mri"));
const AddPatient = lazy(() => import("../views/patient/add-patient"));
const PatientList = lazy(() => import("../views/patient/patient-list"));
const PatientProfile = lazy(() => import("../views/patient/patient-profile"));
const EditPatient = lazy(() => import("../views/patient/edit-patient"));
const AddNurse = lazy(() => import("../views/nurse/add-nurse"));
const NurseList = lazy(() => import("../views/nurse/nurse-list"));
const NurseProfile = lazy(() => import("../views/nurse/nurse-profile"));
const EditNurse = lazy(() => import("../views/nurse/edit-nurse"));
const Calendar = lazy(() => import("../views/calendar/calendar"));
const VideoMeeting = lazy(() => import("../views/video-meeting/video-meeting"));
const HealthcareChatbot = lazy(() => import("../views/chatbot/healthcare-chatbot"));
const Chat = lazy(() => import("../views/chat/chat"));
const NotificationsCenterPage = lazy(() => import("../views/notifications/notifications-center"));
const Alerts = lazy(() => import("../views/ui-elements/alerts"));
const Badges = lazy(() => import("../views/ui-elements/badges"));
const Breadcrumb = lazy(() => import("../views/ui-elements/breadcrumb"));
const Buttons = lazy(() => import("../views/ui-elements/buttons"));
const Cards = lazy(() => import("../views/ui-elements/cards"));
const Carousels = lazy(() => import("../views/ui-elements/carousel"));
const Colors = lazy(() => import("../views/ui-elements/colors"));
const Grid = lazy(() => import("../views/ui-elements/grid"));
const Images = lazy(() => import("../views/ui-elements/images"));
const ListGroups = lazy(() => import("../views/ui-elements/listGroup"));
const Modals = lazy(() => import("../views/ui-elements/modal"));
const Notification = lazy(() => import("../views/ui-elements/notification"));
const Paginations = lazy(() => import("../views/ui-elements/pagination"));
const Popovers = lazy(() => import("../views/ui-elements/popovers"));
const Progressbars = lazy(() => import("../views/ui-elements/progressbars"));
const Tabs = lazy(() => import("../views/ui-elements/tabs"));
const Tooltips = lazy(() => import("../views/ui-elements/tooltips"));
const Typography = lazy(() => import("../views/ui-elements/typography"));
const Video = lazy(() => import("../views/ui-elements/video"));
const FormCheckbox = lazy(() => import("../views/forms/form-checkbox"));
const FormElements = lazy(() => import("../views/forms/form-elements"));
const FormRadio = lazy(() => import("../views/forms/form-radio"));
const FormSwitch = lazy(() => import("../views/forms/form-switch"));
const FormValidatioins = lazy(() => import("../views/forms/form-validations"));
const SimpalWizard = lazy(() => import("../views/wizard/simple-wizard"));
const ValidteWizard = lazy(() => import("../views/wizard/validate-wizard"));
const VerticalWizard = lazy(() => import("../views/wizard/vertical-wizard"));
const BasicTable = lazy(() => import("../views/tables/basic-table"));
const DataTable = lazy(() => import("../views/tables/data-table"));
const EditTable = lazy(() => import("../views/tables/editable-table"));
const ApexChart = lazy(() => import("../views/charts/apex-chart"));
const ChartAm = lazy(() => import("../views/charts/chart-am"));
const ChartPage = lazy(() => import("../views/charts/chart-page"));
const EChart = lazy(() => import("../views/charts/e-chart"));
const Dripicons = lazy(() => import("../views/icons/dripicons"));
const FontAwsomeFive = lazy(() => import("../views/icons/fontawesome-Five"));
const Lineawesome = lazy(() => import("../views/icons/line-awesome"));
const Remixicon = lazy(() => import("../views/icons/remixicon"));
const Unicons = lazy(() => import("../views/icons/unicons"));
const GoogleMap = lazy(() => import("../views/maps/google-map"));
const AccountSetting = lazy(() => import("../views/extra-pages/account-setting"));
const AdminDashboard = lazy(() => import("../views/extra-pages/admin-dashboard"));
const AdminProfile = lazy(() => import("../views/admin/admin-profile"));
const AdminEditProfile = lazy(() => import("../views/admin/admin-edit-profile"));
const AdminDepartments = lazy(() => import("../views/admin/admin-departments"));
const AdminDepartmentDetail = lazy(() => import("../views/admin/admin-department-detail"));
const AdminAppointmentRequests = lazy(() => import("../views/admin/admin-appointment-requests"));
const AdminQuestionnaireBank = lazy(() => import("../views/admin/admin-questionnaire-bank"));
const SuperAdminDashboard = lazy(() => import("../views/super-admin/super-admin-dashboard"));
const UserList = lazy(() => import("../views/super-admin/user-list"));
const AuditorList = lazy(() => import("../views/super-admin/auditor-list"));
const AddAuditor = lazy(() => import("../views/super-admin/add-auditor"));
const EditAuditor = lazy(() => import("../views/super-admin/edit-auditor"));
const ViewAuditor = lazy(() => import("../views/super-admin/view-auditor"));
const CareCoordinatorList = lazy(() => import("../views/super-admin/care-coordinator-list"));
const AddCareCoordinator = lazy(() => import("../views/super-admin/add-care-coordinator"));
const EditCareCoordinator = lazy(() => import("../views/super-admin/edit-care-coordinator"));
const ViewCareCoordinator = lazy(() => import("../views/super-admin/view-care-coordinator"));
const SuperAdminProfile = lazy(() => import("../views/super-admin/super-admin-profile"));
const PlatformUsersHub = lazy(() => import("../views/super-admin/platform-users-hub"));
const AddPlatformAdmin = lazy(() => import("../views/super-admin/add-platform-admin"));
const AdminList = lazy(() => import("../views/super-admin/admin-list"));
const ViewAdmin = lazy(() => import("../views/super-admin/view-admin"));
const EditAdmin = lazy(() => import("../views/super-admin/edit-admin"));
const AuditorDashboard = lazy(() => import("../views/auditor/auditor-dashboard"));
const AuditorLogsPage = lazy(() => import("../views/auditor/auditor-logs"));
const CommingSoon = lazy(() => import("../views/extra-pages/pages-comingsoon"));
const Error404 = lazy(() => import("../views/extra-pages/pages-error-404"));
const Error500 = lazy(() => import("../views/extra-pages/pages-error-500"));
const Faq = lazy(() => import("../views/extra-pages/pages-faq"));
const Invoice = lazy(() => import("../views/extra-pages/pages-invoice"));
const Maintenance = lazy(() => import("../views/extra-pages/pages-maintenance"));
const PricingOne = lazy(() => import("../views/extra-pages/pages-pricing-one"));
const Pricing = lazy(() => import("../views/extra-pages/pages-pricing"));
const Timeline = lazy(() => import("../views/extra-pages/pages-timeline"));
const PrivacyPolicy = lazy(() => import("../views/extra-pages/privacy-policy"));
const PrivacySetting = lazy(() => import("../views/extra-pages/privacy-setting"));
const TermsOfService = lazy(() => import("../views/extra-pages/terms-of-service"));
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
      {
        path: '/patient/brain-mri',
        element: <PatientBrainMri />
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

      //  ------ Video Meeting Route ------
      {
        path: '/video-meeting',
        element: <VideoMeeting />
      },

      //  ------ Health Chatbot Route ------
      {
        path: '/health-chatbot',
        element: <HealthcareChatbot />
      },

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
        path: '/super-admin/platform-users',
        element: <PlatformUsersHub />
      },
      {
        path: '/super-admin/platform-users/add-admin',
        element: <AddPlatformAdmin />
      },
      {
        path: '/super-admin/admins',
        element: <AdminList />
      },
      {
        path: '/super-admin/admins/add',
        element: <AddPlatformAdmin />
      },
      {
        path: '/super-admin/admins/edit/:id',
        element: <EditAdmin />
      },
      {
        path: '/super-admin/admins/:id',
        element: <ViewAdmin />
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
        path: '/super-admin/audit',
        element: (
          <AuditorSessionGuard>
            <AuditorDashboard />
          </AuditorSessionGuard>
        )
      },
      {
        path: '/super-admin/audit-logs',
        element: (
          <AuditorSessionGuard>
            <AuditorLogsPage />
          </AuditorSessionGuard>
        )
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
      {
        path: '/blog',
        element: <Blog />
      },
      {
        path: '/global-news',
        element: <Navigate to="/blog" replace />
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