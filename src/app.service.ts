import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // 🔥 Import bcrypt

@Injectable()
export class AppService {
  // Initialize Prisma inside your service
  private prisma = new PrismaClient();

  getHello(): string {
    return 'Hello World!';
  }

  // Fetch Hero Banners
  async getHeroBanners() {
    try {
      return await this.prisma.heroSlider.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return [];
    }
  }

  // Fetch Featured Products (AutoSlider)
  async getFeaturedProducts() {
    try {
      return await this.prisma.autoSlider.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return [];
    }
  }

  // Fetch All Products
  async getAllProducts() {
    try {
      return await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return [];
    }
  }
  // 🔥 ADD THIS METHOD: Tell Prisma to get the single product
  async getProductById(id: number) {
    try {
      return await this.prisma.product.findUnique({
        where: { id: id },
      });
    } catch (error) {
      return null;
    }
  }

  // Register new user
  // 🔥 ADD THIS FUNCTION
  async registerUser(data: any) {
    const { name, email, password } = data; // Make sure these match your frontend form fields

    // 1. Check if the user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      throw new HttpException(
        'User already exists with this email',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user in the database
    const newUser = await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    // 4. Return the new user (but don't send the password back!)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // 🔥 ADD THIS FUNCTION below your registerUser function
  async loginUser(data: any) {
    const { email, password } = data;

    // 1. Find the user in the database
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 2. Compare the typed password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3. Remove the password before sending the data back
    const { password: _, ...userWithoutPassword } = user;

    // 4. Return it inside a "user" object (Because NextAuth is looking for res.data.user)
    return { user: userWithoutPassword };
  }

  // 🔥 ADD THIS FUNCTION: Save the order to the database
  async createOrder(data: any) {
    const { userEmail, items, totalPrice } = data;

    // 1. Find the user making the order
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // 2. Create the Order and OrderItems in one database transaction
    const newOrder = await this.prisma.order.create({
      data: {
        userId: user.id,
        totalPrice: totalPrice,
        status: 'PENDING',
        // Assuming your Prisma schema has a relation called 'items'
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    return newOrder;
  }

  // 🔥 ADD THIS FUNCTION: Fetch orders and their items from Prisma
  async getUserOrders(email: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          user: {
            email: email, // Find orders belonging to this email
          },
        },
        include: {
          items: true, // Fetch the order items so the frontend can display them
        },
        orderBy: {
          createdAt: 'desc', // Show newest orders first
        },
      });

      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // 🔥 ADD THIS FUNCTION: Fetch all orders from the database
  async getAllOrders() {
    try {
      return await this.prisma.order.findMany({
        include: {
          user: true, // Get the customer's details (name, email)
          items: true, // Get the items they bought
        },
        orderBy: {
          createdAt: 'desc', // Newest orders first
        },
      });
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  // 🔥 Fetch single order with its items and user
  async getOrderById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
      },
    });
  }

  // 🔥 Update the order status
  async updateOrderStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  // 🔥 Delete the product from the database
  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: { id: id },
    });
  }

  // 🔥 Insert the new product into the database
  async createProduct(data: any) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        description: data.description,
        image: data.image || 'https://via.placeholder.com/300',
      },
    });
  }

  // 🔥 Make sure `image: data.image` is added to the data object
  async updateProduct(id: number, data: any) {
    return this.prisma.product.update({
      where: { id: id },
      data: {
        name: data.name,
        price: data.price ? parseFloat(data.price) : undefined,
        stock: data.stock !== undefined ? parseInt(data.stock, 10) : undefined,
        description: data.description,
        image: data.image, // ✅ This handles your new offline image uploads!
      },
    });
  }
}
