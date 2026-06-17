// Routes: admin uses shared /login (see LoginPage redirectTo), not a separate admin login page.
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { Button } from './components/Button'
import { PageSpinner } from './components/PageSpinner'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { DialogProvider } from './context/DialogContext'

// Homepage stays eager for fastest first paint on "/"
import LandingPage from './pages/LandingPage'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const HomePage = lazy(() => import('./pages/HomePage'))
const BrandPage = lazy(() => import('./pages/BrandPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const SellPhonePage = lazy(() => import('./pages/SellPhonePage'))
const SellCategoryPage = lazy(() => import('./pages/SellCategoryPage'))
const SellSubPage = lazy(() => import('./pages/SellSubPage'))
const SellDeviceCheckPage = lazy(() => import('./pages/SellDeviceCheckPage'))
const SellDefectsPage = lazy(() => import('./pages/SellDefectsPage'))
const SellFunctionalProblemsPage = lazy(() => import('./pages/SellFunctionalProblemsPage'))
const SellAccessoriesPage = lazy(() => import('./pages/SellAccessoriesPage'))
const SellQuotePage = lazy(() => import('./pages/SellQuotePage'))
const SellModelDetailPage = lazy(() => import('./pages/SellModelDetailPage'))
const SellAssessmentPage = lazy(() => import('./pages/SellAssessmentPage'))
const BuyAccessoriesPage = lazy(() => import('./pages/BuyAccessoriesPage'))
const RepairPhonePage = lazy(() => import('./pages/RepairPhonePage'))
const FindNewPhonePage = lazy(() => import('./pages/FindNewPhonePage'))
const FindNewGadgetsPage = lazy(() => import('./pages/FindNewGadgetsPage'))
const FindNewGadgetsSectionPage = lazy(() => import('./pages/FindNewGadgetsSectionPage'))
const BuyPreOwnedPage = lazy(() => import('./pages/BuyPreOwnedPage'))
const BuyPreOwnedExplorePage = lazy(() => import('./pages/BuyPreOwnedExplorePage'))
const BuyPreOwnedProductPage = lazy(() => import('./pages/BuyPreOwnedProductPage'))
const NearbyStoresPage = lazy(() => import('./pages/NearbyStoresPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const ShopProductPage = lazy(() => import('./pages/ShopProductPage'))
const ViewDetailsPage = lazy(() => import('./pages/ViewDetailsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const WarrantyPolicyPage = lazy(() => import('./pages/WarrantyPolicyPage'))
const ReferEarnPage = lazy(() => import('./pages/ReferEarnPage'))
const CareersPage = lazy(() => import('./pages/CareersPage'))
const PressReleasesPage = lazy(() => import('./pages/PressReleasesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const InfoPage = lazy(() => import('./pages/InfoPage'))

function LazyPage({ children }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="max-w-md text-sm text-slate-600">
        The page you requested does not exist. Go back to the homepage.
      </p>
      <Button as="a" href="/" variant="primary">
        Go to Home
      </Button>
    </section>
  )
}

export default function App() {
  return (
    <DialogProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
          <ScrollToTopOnRouteChange />
          <Routes>
            <Route
              path="/admin"
              element={
                <LazyPage>
                  <AdminDashboard />
                </LazyPage>
              }
            />
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/home"
                      element={
                        <LazyPage>
                          <HomePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/brand/:brandName"
                      element={
                        <LazyPage>
                          <BrandPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <LazyPage>
                          <LoginPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <LazyPage>
                          <UserDashboard />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <LazyPage>
                          <ProfilePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/sub"
                      element={
                        <LazyPage>
                          <SellSubPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/device-check"
                      element={
                        <LazyPage>
                          <SellDeviceCheckPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/defects"
                      element={
                        <LazyPage>
                          <SellDefectsPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/functional-problems"
                      element={
                        <LazyPage>
                          <SellFunctionalProblemsPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/accessories"
                      element={
                        <LazyPage>
                          <SellAccessoriesPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/quote"
                      element={
                        <LazyPage>
                          <SellQuotePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/model-detail"
                      element={
                        <LazyPage>
                          <SellModelDetailPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/assessment/:brandSlug/:modelSlug"
                      element={
                        <LazyPage>
                          <SellAssessmentPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell/:category"
                      element={
                        <LazyPage>
                          <SellCategoryPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/sell-phone"
                      element={
                        <LazyPage>
                          <SellPhonePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/buy-accessories"
                      element={
                        <LazyPage>
                          <BuyAccessoriesPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/buy-pre-owned/:kind/:slug"
                      element={
                        <LazyPage>
                          <BuyPreOwnedExplorePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/buy-pre-owned/product/:kind/:slug/:productId"
                      element={
                        <LazyPage>
                          <BuyPreOwnedProductPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/buy-pre-owned"
                      element={
                        <LazyPage>
                          <BuyPreOwnedPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/marketplace"
                      element={
                        <LazyPage>
                          <MarketplacePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/repair-phone"
                      element={
                        <LazyPage>
                          <RepairPhonePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/find-new-gadgets"
                      element={
                        <LazyPage>
                          <FindNewGadgetsPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/find-new-gadgets/explore/:slug"
                      element={
                        <LazyPage>
                          <FindNewGadgetsSectionPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/find-new-gadgets/:slug"
                      element={
                        <LazyPage>
                          <FindNewGadgetsSectionPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/find-new-phone"
                      element={
                        <LazyPage>
                          <FindNewPhonePage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <LazyPage>
                          <CartPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <LazyPage>
                          <WishlistPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/nearby-stores"
                      element={
                        <LazyPage>
                          <NearbyStoresPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/shop/:productId"
                      element={
                        <LazyPage>
                          <ShopProductPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/product/:id"
                      element={
                        <LazyPage>
                          <ProductDetailsPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/store/:storeId"
                      element={
                        <LazyPage>
                          <ViewDetailsPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <LazyPage>
                          <AboutPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/new-offers"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/partner"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/contact-us"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/warranty-policy"
                      element={
                        <LazyPage>
                          <WarrantyPolicyPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/refer-earn"
                      element={
                        <LazyPage>
                          <ReferEarnPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/careers"
                      element={
                        <LazyPage>
                          <CareersPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/articles"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/become-partner"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/press-releases"
                      element={
                        <LazyPage>
                          <PressReleasesPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="/terms-and-conditions"
                      element={
                        <LazyPage>
                          <InfoPage />
                        </LazyPage>
                      }
                    />
                    <Route path="/landing" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
    </DialogProvider>
  )
}
