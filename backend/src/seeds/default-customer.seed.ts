import { getRepository } from 'typeorm';
import { Customer } from '../modules/customers/entities/customer.entity';
import { CreateCustomerDto } from '../modules/customers/dto/create-customer.dto';

export async function seedDefaultCustomer() {
  const customerRepository = getRepository(Customer);
  const defaultCustomer: CreateCustomerDto = {
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john@example.com',
    address: '123 Main St',
    note: 'Default seeded customer',
    picture: undefined
  };
  const exists = await customerRepository.findOne({ where: { email: defaultCustomer.email } });
  if (!exists) {
    await customerRepository.save(defaultCustomer);
    console.log('Default customer seeded');
  } else {
    console.log('Default customer already exists');
  }
}