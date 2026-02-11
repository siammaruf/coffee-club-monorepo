import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Loading } from '@/components/ui/loading'

const HomePage = lazy(() => import('@/pages/HomePage'))
const MenuPage = lazy(() => import('@/pages/MenuPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading fullPage text="Loading..." />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LazyPage><HomePage /></LazyPage> },
      { path: 'menu', element: <LazyPage><MenuPage /></LazyPage> },
      { path: 'cart', element: <LazyPage><CartPage /></LazyPage> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <LazyPage><CheckoutPage /></LazyPage>
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LazyPage><LoginPage /></LazyPage> },
      { path: 'register', element: <LazyPage><RegisterPage /></LazyPage> },
      { path: 'forgot-password', element: <LazyPage><ForgotPasswordPage /></LazyPage> },
      { path: 'about', element: <LazyPage><AboutPage /></LazyPage> },
      { path: 'contact', element: <LazyPage><ContactPage /></LazyPage> },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <LazyPage><OrderHistoryPage /></LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <LazyPage><OrderDetailPage /></LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <LazyPage><ProfilePage /></LazyPage>
          </ProtectedRoute>
        ),
      },
      { path: '404', element: <LazyPage><NotFoundPage /></LazyPage> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
])
