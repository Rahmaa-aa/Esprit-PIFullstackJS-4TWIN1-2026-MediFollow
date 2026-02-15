
import DefaultLayout from "../layouts/defaultLayout"
import Index from "../views"

// Dashboard Page
import HospitalDashboardOne from "../views/dashboard-pages/hospital-dashboard-one"
import HospitalDashboardTwo from "../views/dashboard-pages/hospital-dashboard-two"
import PatientDashboard from "../views/dashboard-pages/patient-dashboard"
import Covid19Dashboard from "../views/dashboard-pages/covid-19-dashboard"

// Email Page
import Inbox from "../views/email/inbox"
import EmailCompose from "../views/email/email-compose"

// Doctor Page
import AddDoctor from "../views/doctor/add-doctor"
import DoctorList from "../views/doctor/doctor-list"
import DoctorProfile from "../views/doctor/doctor-profile"
import EditDoctor from "../views/doctor/edit-doctor"

// Calendar Page
import Calendar from "../views/calendar/calendar"

// Chat Page
import Chat from "../views/chat/chat"

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
import BlankPage from "../views/extra-pages/blank-page"
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
import SignIn from "../views/auth/sign-in"
import ConformMail from "../views/auth/confirm-mail"
import SignUp from "../views/auth/sign-up"
import RecoverPassword from "../views/auth/recover-password"
import LockScreen from "../views/auth/lock-screen"
import { path } from "@amcharts/amcharts4/core"

export const DefaultRoute = [
  {
    path: "",
    element: <DefaultLayout />,
    children: [
      //  ------ Dashboard Route ------ 
      {
        path: '/',
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
        path: '/doctor/edit-doctor',
        element: <EditDoctor />
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
        element: <BlankPage />
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