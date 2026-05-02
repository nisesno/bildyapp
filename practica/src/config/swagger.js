import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Bildyapp API',
      version: '1.0.0',
      description: 'API REST de gestion de albaranes (practica final Web II)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Desarrollo local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            number: { type: 'integer' },
            postal: { type: 'string' },
            city: { type: 'string' },
            province: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            lastName: { type: 'string' },
            nif: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'guest'] },
            status: { type: 'string', enum: ['pending', 'verified'] },
            company: { type: 'string', nullable: true },
          },
        },
        Company: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            owner: { type: 'string' },
            name: { type: 'string' },
            cif: { type: 'string' },
            isFreelance: { type: 'boolean' },
            address: { $ref: '#/components/schemas/Address' },
            logo: { type: 'string', nullable: true },
          },
        },
        Client: {
          type: 'object',
          required: ['name', 'cif'],
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            company: { type: 'string' },
            name: { type: 'string', example: 'Garcia Reformas SL' },
            cif: { type: 'string', example: 'B12345678' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            deleted: { type: 'boolean' },
          },
        },
        Project: {
          type: 'object',
          required: ['name', 'projectCode', 'client'],
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            company: { type: 'string' },
            client: { type: 'string' },
            name: { type: 'string' },
            projectCode: { type: 'string', example: 'PRJ-001' },
            email: { type: 'string', format: 'email' },
            notes: { type: 'string' },
            active: { type: 'boolean' },
            address: { $ref: '#/components/schemas/Address' },
            deleted: { type: 'boolean' },
          },
        },
        Worker: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            hours: { type: 'number' },
          },
        },
        DeliveryNote: {
          type: 'object',
          required: ['project', 'format'],
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            company: { type: 'string' },
            client: { type: 'string' },
            project: { type: 'string' },
            format: { type: 'string', enum: ['material', 'hours'] },
            description: { type: 'string' },
            workDate: { type: 'string', format: 'date-time' },
            material: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            hours: { type: 'number' },
            workers: {
              type: 'array',
              items: { $ref: '#/components/schemas/Worker' },
            },
            signed: { type: 'boolean' },
            signedAt: { type: 'string', format: 'date-time', nullable: true },
            signatureUrl: { type: 'string', nullable: true },
            pdfUrl: { type: 'string', nullable: true },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            currentPage: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
