import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ContactModule } from './contact/contact.module';
import { ProjectModule } from './project/project.module';
import { User, UserRole, UserStatus } from './user/user.entity';
import { Contact } from './contact/contact.entity';
import { Project } from './project/project.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает переменные окружения доступными по всему приложению
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE === 'postgres' ? 'postgres' : 'sqlite',
      ...(process.env.DB_TYPE === 'postgres'
        ? {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgrespassword',
            database: process.env.DB_NAME || 'render_agency',
          }
        : {
            database: process.env.DB_NAME || 'database.sqlite',
          }),
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
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
    const userRepository = this.dataSource.getRepository(User);

    // Create a test user
    const existingUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });
    if (!existingUser) {
      const testUser = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });
      await userRepository.save(testUser);
      console.log('Test user created: test@example.com / password123');
    }

    // Create an admin user
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@vraee.com' },
    });
    if (!existingAdmin) {
      const adminUser = userRepository.create({
        email: 'admin@vraee.com',
        password: 'admin123',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        fullName: 'Vraee Admin',
        companyName: 'Vraee Jewelry Studio',
      });
      await userRepository.save(adminUser);
      console.log('Admin user created: admin@vraee.com / admin123');
      console.log('You can now login to /admin/users with these credentials');
    }
  }
}
