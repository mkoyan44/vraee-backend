import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitContact(
    @Body()
    body: {
      name: string;
      email: string;
      company?: string;
      message: string;
    },
  ): Promise<Contact> {
    const { name, email, company, message } = body;
    return await this.contactService.createContact({
      name,
      email,
      company,
      message,
    });
  }
}
