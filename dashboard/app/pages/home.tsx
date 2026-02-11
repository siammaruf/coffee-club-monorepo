import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { categoryService } from "../services/httpServices/categoryService";
import * as IoIcons from "react-icons/io5";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryService.getAll({ limit: 100 }).then((res) => {
      setCategories(res.data || []);
    });
  }, []);
  const visibleCount = 4;
  const maxIndex = Math.max(0, categories.length - visibleCount);
  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));
  const handleNext = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  function getIoIcon(apiIcon: string, props = {}) {
    if (!apiIcon) return <IoIcons.IoFastFoodOutline {...props} />;
    const pascal = "Io" + apiIcon
      .split("-")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    const IconComponent = IoIcons[pascal as keyof typeof IoIcons];
    if (IconComponent) return <IconComponent {...props} />;
    return <IoIcons.IoFastFoodOutline {...props} />;
  }

  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#18171c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-16">
          <div className="flex-1 text-white z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Fastest Delivery &amp; Easy Pickup
            </h2>
            <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 mb-6">
              Coffee Club
            </h1>
            <p className="text-lg mb-6 max-w-lg">
              Good food starts with good ingredients, we only bring you the best.
            </p>
            <div className="flex gap-4 mb-6">
              <Link
                to="/menu"
                className="px-8 py-3 rounded-full bg-red-500 text-white font-semibold text-lg shadow hover:bg-red-600 transition"
              >
                View the Menu
              </Link>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-400 text-black font-bold text-lg">
                <span>20% Discount</span>
              </span>
            </div>
          </div>
          <div className="flex-1 flex justify-center relative">
            <img
              src="/hero-burger.png"
              alt="Kings Burger"
              className="w-[400px] h-auto drop-shadow-2xl z-10"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/hero-bg-pattern.png')] bg-repeat opacity-10 pointer-events-none" />
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-red-500 font-bold mb-2 tracking-widest">
            ABOUT THE FOOD RESTAURANT
          </h3>
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            Perfect Place For An Exceptional Experience
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <img
              src="/about-1.jpg"
              alt="About"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg"
            />
            <div className="flex-1 max-w-xl">
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-red-500 text-2xl font-bold">
                    <i className="fa fa-mobile" />
                  </span>
                  <div>
                    <h4 className="font-bold text-lg">Online Food Ordering</h4>
                    <p className="text-gray-600 text-sm">
                      Order your favorite food online with ease and comfort.
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-red-500 text-2xl font-bold">
                    <i className="fa fa-leaf" />
                  </span>
                  <div>
                    <h4 className="font-bold text-lg">100% Healthy Food</h4>
                    <p className="text-gray-600 text-sm">
                      We use only fresh and healthy ingredients in our recipes.
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-red-500 text-2xl font-bold">
                    <i className="fa fa-truck" />
                  </span>
                  <div>
                    <h4 className="font-bold text-lg">Fast Delivery</h4>
                    <p className="text-gray-600 text-sm">
                      Get your food delivered to your doorstep quickly and safely.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <img
              src="/about-2.jpg"
              alt="About"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-[#f9f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            Choose a Category
          </h2>
          <div className="relative">
            {/* Carousel Controls */}
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full w-10 h-10 flex items-center justify-center shadow disabled:opacity-50"
              aria-label="Previous"
              type="button"
            >
              <span className="text-2xl font-bold pb-[6px]">&#8592;</span>
            </button>
            <button
              onClick={handleNext}
              disabled={current === maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full w-10 h-10 flex items-center justify-center shadow disabled:opacity-50"
              aria-label="Next"
              type="button"
            >
              <span className="text-2xl font-bold pb-[6px]">&#8594;</span>
            </button>
            {/* Carousel */}
            <div
              ref={sliderRef}
              className="overflow-hidden px-[30px]"
            >
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${current * (100 / visibleCount)}%)`,
                  width: `${(categories.length / visibleCount) * 100}%`,
                }}
              >
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col items-center flex-shrink-0"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <span className="w-32 h-32 rounded-full bg-yellow-100 flex items-center justify-center mb-3 shadow text-6xl text-yellow-500">
                      {getIoIcon(cat.icon, { className: "w-12 h-12" })}
                    </span>
                    <span className="font-semibold text-lg">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                How We Work
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <span className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl text-red-500 mb-3">
                    <i className="fa fa-search" />
                  </span>
                  <h4 className="font-bold mb-2">Explore Menu</h4>
                  <p className="text-gray-600 text-sm text-center">
                    Browse our delicious menu and find your favorite dish.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl text-red-500 mb-3">
                    <i className="fa fa-cutlery" />
                  </span>
                  <h4 className="font-bold mb-2">Choose a Dish</h4>
                  <p className="text-gray-600 text-sm text-center">
                    Pick the dish you want to enjoy from our menu.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl text-red-500 mb-3">
                    <i className="fa fa-shopping-cart" />
                  </span>
                  <h4 className="font-bold mb-2">Place Order</h4>
                  <p className="text-gray-600 text-sm text-center">
                    Order online or call us for fast delivery or pickup.
                  </p>
                </div>
              </div>
            </div>
            <img
              src="/how-we-work.jpg"
              alt="How We Work"
              className="w-96 h-72 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Fast Food Menu Section */}
      <section className="py-16 bg-[#f9f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            Fast Food Menus
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Example menu items */}
            <MenuCard
              img="/menu-bacon-burger.jpg"
              name="Shroom Bacon Burger"
              price="11.76"
            />
            <MenuCard
              img="/menu-black-coffee.jpg"
              name="Delicious Black Coffee"
              price="9.17"
            />
            <MenuCard
              img="/menu-bbq-pizza.jpg"
              name="BBQ Chicken Pizza New"
              price="13.17"
            />
            <MenuCard
              img="/menu-crispy-chicken.jpg"
              name="Crispy Fried Chicken"
              price="9.85"
            />
            <MenuCard
              img="/menu-zinger-burger.jpg"
              name="Zinger Double Burger"
              price="10.10"
            />
            <MenuCard
              img="/menu-margherita-pizza.jpg"
              name="Margherita Pizza New"
              price="11.50"
            />
            <MenuCard
              img="/menu-black-pepper.jpg"
              name="Black Pepper Burger"
              price="10.85"
            />
            {/* Opening times card */}
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-6 border border-yellow-100">
              <span className="text-lg font-bold mb-2">OPENING TIMES</span>
              <span className="text-2xl font-extrabold text-red-500 mb-2">
                8:00 AM - 11:00 PM
              </span>
              <span className="text-gray-600 text-sm">Monday - Sunday</span>
              <span className="mt-4 text-yellow-600 font-bold">
                +1 (234) 567-890
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            We Provide Best Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <ServiceCard
              icon="fa fa-coffee"
              title="Afternoon Tea"
              desc="Enjoy a relaxing afternoon with our special tea selection."
            />
            <ServiceCard
              icon="fa fa-glass"
              title="Wine & Cocktails"
              desc="A wide range of wines and cocktails for every taste."
            />
            <ServiceCard
              icon="fa fa-truck"
              title="Takeaway & Delivery"
              desc="Order online and get your food delivered fast."
            />
            <ServiceCard
              icon="fa fa-sun-o"
              title="Alfresco Dining"
              desc="Dine outdoors and enjoy the fresh air."
            />
            <ServiceCard
              icon="fa fa-star"
              title="Quality Food"
              desc="Only the best ingredients and recipes."
            />
            <ServiceCard
              icon="fa fa-users"
              title="Friendly Staff"
              desc="Our staff is always ready to serve you."
            />
          </div>
        </div>
      </section>

      {/* Unique Experiences Section */}
      <section className="py-16 bg-[#f9f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            A Collection of Unique Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ExperienceCard
              img="/exp-valentine.jpg"
              title="Valentine’s Day Private Table"
              desc="Romantic setup, candle light, and special menu."
            />
            <ExperienceCard
              img="/exp-birthday.jpg"
              title="Birthday Party Event Special"
              desc="Celebrate your birthday with us and enjoy exclusive offers."
            />
            <ExperienceCard
              img="/exp-baby-shower.jpg"
              title="Baby Shower & Family Events"
              desc="Host your family events in our cozy restaurant."
            />
          </div>
        </div>
      </section>

      {/* Complimentary Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            A Complimentary Cocktail, Coffee, Ice-Tea For You.
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <MenuCard
              img="/menu-crispy-chicken.jpg"
              name="Crispy Fried Chicken"
              price="10.85"
            />
            <MenuCard
              img="/menu-bbq-pizza.jpg"
              name="BBQ Chicken Pizza"
              price="13.17"
            />
            <MenuCard
              img="/menu-black-coffee.jpg"
              name="Delicious Black Coffee"
              price="11.16"
            />
            <MenuCard
              img="/menu-margherita-pizza.jpg"
              name="Margherita Pizza"
              price="15.80"
            />
          </div>
          <div className="text-center mt-8 text-lg font-bold text-red-600">
            Booking Calling:{" "}
            <span className="text-black">+1 (234) 567-890</span>
          </div>
        </div>
      </section>

      {/* Best Seller Deals Section */}
      <section className="py-16 bg-[#f9f9fb]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            Best Seller Deals
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1 bg-white rounded-2xl shadow p-6 border border-yellow-100">
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span>Fish Vegetables</span>
                  <span className="font-bold text-red-500">$10.85</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Buffet Vegas</span>
                  <span className="font-bold text-red-500">$9.85</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Funky Grill</span>
                  <span className="font-bold text-red-500">$11.50</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Tasty Snacks</span>
                  <span className="font-bold text-red-500">$8.50</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Smoked Drinks</span>
                  <span className="font-bold text-red-500">$7.50</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <img
                src="/menu-buffet-vegas.jpg"
                alt="Buffet Vegas"
                className="w-64 h-64 object-cover rounded-2xl shadow-lg mb-4"
              />
              <span className="text-xl font-bold">Buffet Vegas</span>
              <span className="text-red-500 font-bold text-lg">$10.85</span>
              <span className="text-gray-600 text-sm mt-2">
                Best burger in town for your lunch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-10">
            Follow Coffee Club
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <img
              src="/insta-1.jpg"
              alt="Instagram 1"
              className="w-full h-40 object-cover rounded-xl"
            />
            <img
              src="/insta-2.jpg"
              alt="Instagram 2"
              className="w-full h-40 object-cover rounded-xl"
            />
            <img
              src="/insta-3.jpg"
              alt="Instagram 3"
              className="w-full h-40 object-cover rounded-xl"
            />
            <img
              src="/insta-4.jpg"
              alt="Instagram 4"
              className="w-full h-40 object-cover rounded-xl"
            />
            <img
              src="/insta-5.jpg"
              alt="Instagram 5"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

// Helper components for cards
function MenuCard({
  img,
  name,
  price,
}: {
  img: string;
  name: string;
  price: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center border border-yellow-100">
      <img
        src={img}
        alt={name}
        className="w-28 h-28 object-cover rounded-full mb-3 shadow"
      />
      <span className="font-bold text-lg mb-1">{name}</span>
      <span className="text-red-500 font-bold text-md">${price}</span>
      <button className="mt-3 px-4 py-1 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition text-sm">
        Add
      </button>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-[#f9f9fb] rounded-2xl shadow p-6 flex flex-col items-center border border-yellow-100">
      <span className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl text-red-500 mb-3">
        <i className={icon} />
      </span>
      <span className="font-bold text-lg mb-2">{title}</span>
      <span className="text-gray-600 text-sm text-center">{desc}</span>
    </div>
  );
}

function ExperienceCard({
  img,
  title,
  desc,
}: {
  img: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center border border-yellow-100">
      <img
        src={img}
        alt={title}
        className="w-full h-40 object-cover rounded-xl mb-3"
      />
      <span className="font-bold text-lg mb-1">{title}</span>
      <span className="text-gray-600 text-sm text-center">{desc}</span>
    </div>
  );
}
