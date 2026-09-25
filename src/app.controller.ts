import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🔥 ADD THESE ROUTES
  @Get('hero-banners')
  async getHeroBanners() {
    return this.appService.getHeroBanners();
  }

  @Get('featured-products')
  async getFeaturedProducts() {
    return this.appService.getFeaturedProducts();
  }

  @Get('products')
  async getAllProducts() {
    return this.appService.getAllProducts();
  }
  // 🔥 ADD THIS ROUTE: Fetch single product by ID
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    // Note: If your Prisma ID is an integer, you must convert it to a Number first
    return this.appService.getProductById(Number(id));
  }
  // 🔥 ADD THIS: The registration endpoint Next.js is looking for
  @Post('auth/register')
  async register(@Body() body: any) {
    return this.appService.registerUser(body);
  }

  // 🔥 ADD THIS: The login endpoint Next.js is looking for
  @Post('auth/login')
  async login(@Body() body: any) {
    return this.appService.loginUser(body);
  }

  // 🔥 ADD THIS ROUTE: Receive the new order
  @Post('orders')
  async createOrder(@Body() body: any) {
    return this.appService.createOrder(body);
  }

  // 🔥 ADD THIS ROUTE: Fetch orders for a specific user
  @Get('orders/user/:email')
  async getUserOrders(@Param('email') email: string) {
    return this.appService.getUserOrders(email);
  }

  // edit and upadate product
  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updateProduct(Number(id), updateData);
  }
  // 🔥 ADD THIS ROUTE: Fetch ALL orders for the Admin dashboard
  @Get('orders')
  async getAllOrders() {
    return this.appService.getAllOrders();
  }

  // 🔥 GET a single order by ID
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.appService.getOrderById(Number(id));
  }

  // 🔥 PATCH (update) an order's status
  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.appService.updateOrderStatus(Number(id), body.status);
  }

  // 🔥 DELETE a product by ID
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.appService.deleteProduct(Number(id));
  }

  // 🔥 CREATE a new product
  @Post('products')
  async createProduct(@Body() productData: any) {
    return this.appService.createProduct(productData);
  }
}
