import ProductNavbarClient from './ProductNavbarClient'

export default function ProductNavbar({ categories = [] }) {
  return <ProductNavbarClient categories={categories} />
}
