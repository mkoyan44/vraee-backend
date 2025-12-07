import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createContact(contactData: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }): Promise<Contact> {
    const contact = this.contactRepository.create(contactData);
    return await this.contactRepository.save(contact);
  }

  async getContacts(): Promise<Contact[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getContactById(id: number): Promise<Contact | null> {
    return await this.contactRepository.findOneBy({ id });
  }
}
