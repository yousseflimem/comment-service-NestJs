# Migration Guide: Spring Boot to NestJS

This document explains how the Comment Service was migrated from Spring Boot (MySQL) to NestJS (MongoDB).

## Architecture Changes

### Database
- **Before**: MySQL with JPA/Hibernate
- **After**: MongoDB with Mongoose ODM

### Framework Stack
- **Before**: Spring Boot + Spring Data JPA + Spring Security
- **After**: NestJS + Mongoose + Passport JWT

---

## Component Mapping

### 1. Entity / Model

#### Spring Boot (JPA Entity)
```java
@Entity
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;
    
    @Column(nullable = false)
    private String content;
    
    private LocalDateTime publicationDate;
    private LocalDateTime lastModifiedDate;
    
    @Column(nullable = false)
    private Long campaignId;
    
    @Column(nullable = false)
    private Long citizenId;
}
```

#### NestJS (Mongoose Schema)
```typescript
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  publicationDate: Date;

  @Prop({ type: Date, default: null })
  lastModifiedDate: Date;

  @Prop({ required: true })
  campaignId: number;

  @Prop({ required: true })
  citizenId: number;
}
```

**Key Changes:**
- Auto-generated `_id` instead of `commentId`
- `@Schema` instead of `@Entity`
- `@Prop` instead of `@Column`
- MongoDB ObjectId vs Long ID

---

### 2. Repository / Data Access

#### Spring Boot (JPA Repository)
```java
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCampaignId(Long campaignId);
}
```

#### NestJS (Mongoose Model)
```typescript
@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) 
    private commentModel: Model<CommentDocument>
  ) {}

  async findByCampaignId(campaignId: number) {
    return this.commentModel.find({ campaignId }).exec();
  }
}
```

**Key Changes:**
- Direct model injection instead of repository interface
- Manual query methods using Mongoose API
- Async/await pattern

---

### 3. DTOs

#### Spring Boot
```java
@Data
public class CommentRequestDTO {
    private String content;
    private Long campaignId;
}

@Data
public class CommentResponseDTO {
    private Long commentId;
    private String content;
    private LocalDateTime publicationDate;
    private LocalDateTime lastModifiedDate;
    private Long campaignId;
    private Long citizenId;
}
```

#### NestJS
```typescript
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  campaignId: number;
}

export class CommentResponseDto {
  commentId: string;
  content: string;
  publicationDate: Date;
  lastModifiedDate: Date | null;
  campaignId: number;
  citizenId: number;
}
```

**Key Changes:**
- Decorators for validation (class-validator)
- TypeScript types instead of Java types
- No Lombok needed

---

### 4. Service Layer

#### Spring Boot
```java
@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final AuthClient authClient;
    
    public CommentResponseDTO addComment(CommentRequestDTO dto, String jwt) {
        UserDTO user = authClient.getCurrentUser("Bearer " + jwt);
        Comment comment = commentMapper.toEntity(dto);
        comment.setCitizenId(user.getId());
        comment.setPublicationDate(LocalDateTime.now());
        
        Comment saved = commentRepository.save(comment);
        return commentMapper.toResponseDTO(saved);
    }
}
```

#### NestJS
```typescript
@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private authService: AuthService,
  ) {}

  async createComment(dto: CreateCommentDto, token: string) {
    const user = await this.authService.getCurrentUser(token);
    
    const newComment = new this.commentModel({
      content: dto.content,
      campaignId: dto.campaignId,
      citizenId: user.id,
      publicationDate: new Date(),
    });

    const saved = await newComment.save();
    return this.toResponseDto(saved);
  }
}
```

**Key Changes:**
- Constructor injection with TypeScript
- Async/await for all database operations
- Manual mapping instead of MapStruct

---

### 5. Controller

#### Spring Boot
```java
@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponseDTO> createComment(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody CommentRequestDTO dto
    ) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(commentService.addComment(dto, token));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getAllComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }
}
```

#### NestJS
```typescript
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Headers('authorization') authorization: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const token = authorization.substring(7);
    return this.commentService.createComment(createCommentDto, token);
  }

  @Get()
  async getAllComments() {
    return this.commentService.findAll();
  }
}
```

**Key Changes:**
- `@Controller` instead of `@RestController`
- Guards for authentication instead of method-level security
- Direct return values (no ResponseEntity wrapper)
- Decorators for HTTP methods

---

### 6. Security / Authentication

#### Spring Boot (JWT Decoder)
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${jwt.secret}")
    private String secretKey;

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] secretBytes = Base64.getDecoder().decode(secretKey);
        SecretKeySpec keySpec = new SecretKeySpec(secretBytes, "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(keySpec)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }
}
```

#### NestJS (Passport JWT Strategy)
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(
        configService.get<string>('JWT_SECRET'),
        'base64',
      ),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
```

**Key Changes:**
- Passport strategy pattern
- Guards for route protection
- ConfigService for environment variables

---

### 7. External Service Communication

#### Spring Boot (Feign Client)
```java
@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthClient {
    @GetMapping("/auth/me")
    UserDTO getCurrentUser(@RequestHeader("Authorization") String token);
}
```

#### NestJS (Axios HTTP Client)
```typescript
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async getCurrentUser(token: string): Promise<UserDto> {
    const response = await axios.get(
      `${this.authServiceUrl}/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}
```

**Key Changes:**
- Axios instead of Feign
- Manual HTTP calls with error handling
- Promise-based API

---

### 8. Configuration

#### Spring Boot (application.properties)
```properties
spring.application.name=comment-service
server.port=8084
spring.datasource.url=jdbc:mysql://localhost:3306/hand4pal_comments_db
jwt.secret=VHJlcyBTZWNyZXQgS2V5...
auth-service.url=http://localhost:8081
```

#### NestJS (.env)
```env
PORT=8084
MONGODB_URI=mongodb://localhost:27017/hand4pal_comments_db
JWT_SECRET=VHJlcyBTZWNyZXQgS2V5...
AUTH_SERVICE_URL=http://localhost:8081
```

**Key Changes:**
- `.env` file instead of `.properties`
- ConfigModule for centralized config
- Environment-specific files support

---

## Database Migration

### Schema Conversion

#### MySQL Table
```sql
CREATE TABLE comment (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    publication_date DATETIME,
    last_modified_date DATETIME,
    campaign_id BIGINT NOT NULL,
    citizen_id BIGINT NOT NULL
);
```

#### MongoDB Collection
```javascript
{
  _id: ObjectId("..."),
  content: "string",
  publicationDate: ISODate("..."),
  lastModifiedDate: ISODate("...") | null,
  campaignId: NumberInt(1),
  citizenId: NumberInt(123)
}
```

### Data Migration Script (Optional)

If you need to migrate existing data from MySQL to MongoDB:

```javascript
// migration.js
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function migrate() {
  const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'hand4pal_comments_db'
  });

  const mongoClient = new MongoClient('mongodb://localhost:27017');
  await mongoClient.connect();
  const db = mongoClient.db('hand4pal_comments_db');
  const collection = db.collection('comments');

  const [rows] = await mysqlConn.execute('SELECT * FROM comment');

  const documents = rows.map(row => ({
    content: row.content,
    publicationDate: row.publication_date,
    lastModifiedDate: row.last_modified_date,
    campaignId: row.campaign_id,
    citizenId: row.citizen_id
  }));

  if (documents.length > 0) {
    await collection.insertMany(documents);
  }

  await mysqlConn.end();
  await mongoClient.close();
  console.log(`Migrated ${documents.length} comments`);
}

migrate().catch(console.error);
```

---

## Testing Changes

### Unit Tests

#### Spring Boot (JUnit)
```java
@SpringBootTest
public class CommentServiceTest {
    @Mock
    private CommentRepository repository;
    
    @InjectMocks
    private CommentService service;
    
    @Test
    public void testCreateComment() {
        // Test implementation
    }
}
```

#### NestJS (Jest)
```typescript
describe('CommentService', () => {
  let service: CommentService;
  let model: Model<CommentDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getModelToken(Comment.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should create a comment', async () => {
    // Test implementation
  });
});
```

---

## Performance Considerations

### Indexing

Add indexes in MongoDB for better performance:

```typescript
// In comment.schema.ts
CommentSchema.index({ campaignId: 1 });
CommentSchema.index({ citizenId: 1 });
CommentSchema.index({ publicationDate: -1 });
```

### Query Optimization

MongoDB queries are different from SQL:

```typescript
// Get recent comments for a campaign
this.commentModel
  .find({ campaignId })
  .sort({ publicationDate: -1 })
  .limit(10)
  .exec();
```

---

## Deployment Differences

### Spring Boot
- Build JAR file
- Run with Java Runtime
- Configure JVM parameters

### NestJS
- Build TypeScript to JavaScript
- Run with Node.js
- Configure Node.js environment

---

## Benefits of NestJS + MongoDB

1. **Flexibility**: Schema-less design allows easier evolution
2. **Performance**: MongoDB handles large datasets efficiently
3. **Developer Experience**: TypeScript provides better type safety
4. **Modern Stack**: Async/await, decorators, modular architecture
5. **Scalability**: Horizontal scaling with MongoDB sharding

---

## Challenges & Solutions

### Challenge 1: ID Generation
- **Issue**: MySQL auto-increment vs MongoDB ObjectId
- **Solution**: Use ObjectId and convert to string in responses

### Challenge 2: Transaction Support
- **Issue**: MongoDB transactions work differently
- **Solution**: Use Mongoose transactions when needed

### Challenge 3: Relations
- **Issue**: No foreign keys in MongoDB
- **Solution**: Store IDs and validate at application level

---

## Checklist for Migration

- [x] Entity → Schema conversion
- [x] Repository → Model injection
- [x] Service layer rewrite
- [x] Controller adaptation
- [x] DTOs with validation
- [x] JWT authentication setup
- [x] External service calls (Auth)
- [x] Environment configuration
- [x] Error handling
- [x] API documentation
- [x] Postman collection
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Production deployment

---

## Next Steps

1. Test all endpoints thoroughly
2. Add comprehensive unit tests
3. Set up CI/CD pipeline
4. Configure production MongoDB
5. Implement logging and monitoring
6. Add rate limiting
7. Set up backup strategy

---

## Support

For migration support or questions, contact the development team.
