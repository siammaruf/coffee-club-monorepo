import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { Loading } from '@/components/ui/loading'

// SSR-critical public pages: eager imports for fast server render
import HomePage from '@/pages/HomePage'
import MenuPage from '@/pages/MenuPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'

// SSR-ready public pages: blog & reservation
const BlogPage = lazy(() => import('@/pages/BlogPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const ReservationPage = lazy(() => import('@/pages/ReservationPage'))

// Protected / auth pages: lazy loaded (client-only)
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading fullPage text="Loading..." />}>
      {children}
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // SSR-ready public pages (eager)
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'blog', element: <LazyPage><BlogPage /></LazyPage> },
      { path: 'blog/:slug', element: <LazyPage><BlogPostPage /></LazyPage> },
      { path: 'reservation', element: <LazyPage><ReservationPage /></LazyPage> },

      // Client-only pages (lazy)
      {
        path: 'cart',
        element: (
          <LazyPage>
            <CartPage />
          </LazyPage>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <CheckoutPage />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LazyPage>
              <LoginPage />
            </LazyPage>
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <LazyPage>
              <RegisterPage />
            </LazyPage>
          </GuestRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestRoute>
            <LazyPage>
              <ForgotPasswordPage />
            </LazyPage>
          </GuestRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <OrderHistoryPage />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <OrderDetailPage />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <ProfilePage />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: '404',
        element: (
          <LazyPage>
            <NotFoundPage />
          </LazyPage>
        ),
      },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]
