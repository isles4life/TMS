# Contributing to TMS

## Code Style Guidelines

### C# (.NET Backend)

- Use meaningful variable names
- Follow Pascal casing for class and method names
- Use camelCase for local variables and parameters
- Always use `async`/`await` for I/O operations
- Use dependency injection for all external dependencies

**Example:**
```csharp
public class LoadService : ILoadService
{
    private readonly IRepository<Load> _repository;
    
    public LoadService(IRepository<Load> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }
    
    public async Task<Load> CreateLoadAsync(CreateLoadRequest request)
    {
        ValidateRequest(request);
        var load = new Load { /* ... */ };
        return await _repository.AddAsync(load);
    }
}
```

### TypeScript/Angular (Frontend)

- Use strict type checking
- Avoid `any` types
- Use interfaces for all data structures
- Follow Material Design guidelines
- Use reactive programming with RxJS

**Example:**
```typescript
@Component({
  selector: 'app-load-form',
  template: `...`
})
export class LoadFormComponent implements OnInit {
  form: FormGroup;
  
  constructor(private formBuilder: FormBuilder) {
    this.form = this.createForm();
  }
  
  private createForm(): FormGroup {
    return this.formBuilder.group({
      loadNumber: ['', Validators.required],
      revenue: [0, Validators.min(0)]
    });
  }
}
```

## Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make commits with clear messages: `git commit -m "feat: add power-only load creation"`
3. Push to remote: `git push origin feature/my-feature`
4. Create pull request
5. Address code review comments
6. Merge when approved

## Testing Requirements

- Backend: Minimum 70% code coverage
- Frontend: Unit tests for all services and components
- Integration tests for API endpoints

```bash
# Run backend tests
dotnet test

# Run frontend tests
ng test
```

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Test addition/modification
- `chore`: Build, dependencies

Example:
```
feat(power-only): add load creation endpoint

Implement POST /api/v1/power-only/loads endpoint
with validation and error handling.

Closes #123
```

## Security Guidelines

1. Never commit secrets or credentials
2. Validate all user input
3. Use parameterized queries to prevent SQL injection
4. Implement proper CORS policies
5. Use HTTPS in production
6. Implement rate limiting

## Performance Considerations

1. Use async/await for all I/O operations
2. Implement caching for frequently accessed data
3. Use pagination for large result sets
4. Index database columns used in WHERE clauses
5. Lazy load Angular components
6. Minimize bundle size with tree shaking

## Documentation

- Update API documentation for new endpoints
- Add XML comments to public methods
- Update README for significant changes
- Create architecture decision records (ADR) for major changes

## Questions?

Open an issue or contact the development team.
