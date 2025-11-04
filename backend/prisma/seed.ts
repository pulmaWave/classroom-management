import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@classroom.com',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'ADMIN'
    }
  });

  // Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@classroom.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn A',
      role: 'TEACHER',
      teacherProfile: {
        create: {
          teacherId: 'GV001',
          department: 'Khoa Công nghệ Thông tin',
          qualification: 'Thạc sĩ',
          specialization: 'Lập trình Web'
        }
      }
    }
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@classroom.com',
      password: hashedPassword,
      fullName: 'Trần Thị B',
      role: 'TEACHER',
      teacherProfile: {
        create: {
          teacherId: 'GV002',
          department: 'Khoa Công nghệ Thông tin',
          qualification: 'Tiến sĩ',
          specialization: 'Trí tuệ nhân tạo'
        }
      }
    }
  });

  // Create Students
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@classroom.com`,
        password: hashedPassword,
        fullName: `Sinh viên ${i}`,
        role: 'STUDENT',
        studentProfile: {
          create: {
            studentId: `SV${String(i).padStart(3, '0')}`,
            dateOfBirth: new Date(2003, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            major: 'Công nghệ Thông tin',
            academicYear: 'K18'
          }
        }
      }
    });
    students.push(student);
  }

  // Create Classrooms
  const classroom1 = await prisma.classroom.create({
    data: {
      classroomCode: 'WEB101',
      name: 'Lập trình Web cơ bản',
      description: 'Học HTML, CSS, JavaScript cơ bản',
      teacherId: teacher1.id,
      subject: 'Lập trình Web',
      room: 'P301',
      schedule: 'Thứ 2, Thứ 4: 7h-9h',
      semester: 'HK1 2024-2025',
      maxStudents: 40,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-01-15')
    }
  });

  const classroom2 = await prisma.classroom.create({
    data: {
      classroomCode: 'AI201',
      name: 'Trí tuệ nhân tạo nâng cao',
      description: 'Machine Learning, Deep Learning',
      teacherId: teacher2.id,
      subject: 'Trí tuệ nhân tạo',
      room: 'P205',
      schedule: 'Thứ 3, Thứ 5: 13h-15h',
      semester: 'HK1 2024-2025',
      maxStudents: 30,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-01-15')
    }
  });

  console.log('✅ Database seeding completed!');
  console.log('\n📧 Test accounts:');
  console.log('Admin: admin@classroom.com / password123');
  console.log('Teacher 1: teacher1@classroom.com / password123');
  console.log('Teacher 2: teacher2@classroom.com / password123');
  console.log('Student 1-10: student1@classroom.com ... student10@classroom.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });