import { useParams } from 'react-router-dom';
import { ANNOUNCED_CARS } from '../constants/announcedVehicles';
import { toSlug } from '../utils/slug';
import CarDetailPage from './CarDetailPage';
import AnnouncedCarPage from './AnnouncedCarPage';

export default function CatalogCarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const announced = ANNOUNCED_CARS.find(car => toSlug(car.brand, car.model) === slug);
  return announced ? <AnnouncedCarPage car={announced} /> : <CarDetailPage />;
}
