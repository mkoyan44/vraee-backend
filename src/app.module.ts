import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ContactModule } from './contact/contact.module';
import { ProjectModule } from './project/project.module';
import { User, UserRole } from './user/user.entity';
import { Contact } from './contact/contact.entity';
import { Project } from './project/project.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает переменные окружения доступными по всему приложению
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
      entities: [User, Contact, Project],
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
    AuthModule,
    ProfileModule,
    ContactModule,
    ProjectModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    // Create a test user
    const userRepository = this.dataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email: 'test@example.com' } });
    if (!existingUser) {
      const testUser = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      });
      await userRepository.save(testUser);
      console.log('Test user created: test@example.com / password123');
    }
  }
}
