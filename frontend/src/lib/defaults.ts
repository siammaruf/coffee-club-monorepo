import type { HeroSlide, Advantage, Testimonial, WebsiteSettings } from '@/types/websiteContent'

/**
 * Default content used as fallback when the API is unavailable.
 * These match the backend seed data in website-content.service.ts.
 */

export const defaultSlides: HeroSlide[] = [
  {
    id: 'default-1',
    type: 'centered',
    image: '/img/pizza_1.png',
    title: 'CoffeeClub',
    subtitle: null,
    heading: null,
    description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
    show_cta: false,
    bg_image: false,
    sort_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-2',
    type: 'side-text',
    image: '/img/pizza_2.png',
    title: 'CoffeeClub Pizza.',
    subtitle: null,
    heading: 'Making people happy',
    description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
    show_cta: true,
    bg_image: false,
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-3',
    type: 'side-text',
    image: '/img/pizza_3.png',
    title: 'CoffeeClub Pizza.',
    subtitle: null,
    heading: 'Making people happy',
    description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
    show_cta: true,
    bg_image: false,
    sort_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-4',
    type: 'bg-image',
    image: '/img/slide_2.jpg',
    title: 'CoffeeClub Pizza.',
    subtitle: null,
    heading: 'Making people happy',
    description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
    show_cta: true,
    bg_image: true,
    sort_order: 3,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export const defaultAdvantages: Advantage[] = [
  {
    id: 'default-adv-1',
    icon: '/img/icon_1.png',
    title: 'Quality Foods',
    description:
      'Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.',
    sort_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-adv-2',
    icon: '/img/icon_3.png',
    title: 'Fastest Delivery',
    description:
      'Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.',
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-adv-3',
    icon: '/img/icon_2.png',
    title: 'Original Recipes',
    description:
      'Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.',
    sort_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export const defaultTestimonials: Testimonial[] = [
  {
    id: 'default-test-1',
    quote:
      'CoffeeClub was one of the first restaurants I discovered upon moving to New York last summer, and it remains a favorite. Despite its sizable menu full of pastas, sandwiches, and pizzas, I almost always get the same thing \u2013 the Vincent pizza. It\'s made with Ricotta & Marinara sauces, spiced with oregano, and topped with eggplant, red onions, basil, Pecorino Romano & Mozzarella. It really is one of the best pizzas I\'ve ever had \u2013 and I eat a lot of pizza.',
    image: '/img/testimonial_1-200x200.jpg',
    name: 'Adam Jefferson',
    position: 'Lawyer, New York',
    sort_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'default-test-2',
    quote:
      'The pizza is delicious! The crust is thin and crispy, great sauce, and awesome cheese blend. And it makes a cute cheap date!',
    image: '/img/testimonial_2-200x200.jpg',
    name: 'Samantha Greenberg',
    position: 'Artist, Boston',
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export const defaultSettings: WebsiteSettings = {
  phone: '+1 215 456 15 15',
  hours: '8:00 am \u2013 11:30 pm',
  social: {
    twitter: 'https://twitter.com/',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
  },
  newsletter: {
    title: 'Subscribe for Our Newsletter',
    subtitle: '',
  },
  about: {
    title: 'We Are CoffeeClub',
    subtitle: "We don't just make pizza. We make people's days.",
    paragraph1:
      'CoffeeClub was born in 2014 from a simple idea: create a space where people could enjoy exceptional coffee and food in a warm, welcoming environment. Our founder spent years traveling across coffee-producing regions, learning the art of roasting and brewing before bringing that expertise home to Dhaka.\n\nWhat started as a small 20-seat cafe in Gulshan has grown into one of the most beloved coffee destinations in the city. But through all the growth, our core mission has remained the same: serve great coffee, make delicious food, and create a space where everyone feels at home.',
    paragraph2:
      'Today, CoffeeClub serves over 500 customers daily, offers more than 50 menu items, and has become the go-to spot for morning coffee, business meetings, study sessions, and weekend brunches. Our online ordering platform makes it easier than ever to enjoy your CoffeeClub favorites wherever you are.\n\nWe source only the finest beans from Ethiopia, Colombia, and Guatemala. Every cup is crafted with precision and care by our team of trained baristas. Our kitchen team prepares each dish from scratch using fresh, locally sourced ingredients wherever possible. Quality is not just a word for us -- it is a promise.',
  },
}
