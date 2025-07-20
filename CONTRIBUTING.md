# Contributing to EduTutor

Thank you for your interest in contributing to EduTutor! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git knowledge
- Basic understanding of React and TypeScript

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/yourusername/edututor.git
cd edututor
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Add your API keys and database URL
```

3. **Database Setup**
```bash
npm run db:generate
npm run db:migrate
```

4. **Start Development**
```bash
npm run dev
```

## 📝 How to Contribute

### Types of Contributions
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations
- 🧪 Test coverage improvements

### Before You Start
1. Check existing [issues](https://github.com/yourusername/edututor/issues) and [pull requests](https://github.com/yourusername/edututor/pulls)
2. Create an issue to discuss major changes
3. Follow our coding standards and conventions

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization
```
client/src/
├── components/     # Reusable UI components
├── pages/          # Main application pages
├── lib/            # Utilities and configurations
├── store/          # Global state management
└── types/          # TypeScript type definitions

server/
├── services/       # AI and external API services
├── utils/          # Server utilities
└── routes.ts       # API endpoints
```

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(chat): add new tutor persona for chemistry
fix(pdf): resolve text extraction error
docs(readme): update installation instructions
style(ui): improve dark mode contrast
```

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description` 
- Documentation: `docs/description`
- Refactor: `refactor/description`

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Writing Tests
- Add tests for new features
- Test edge cases and error conditions
- Use descriptive test names
- Follow existing test patterns

## 📦 Pull Request Process

### Before Submitting
1. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

2. **Update documentation** if needed

3. **Check for breaking changes**

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🐛 Bug Reports

### How to Report Bugs
1. Use the issue template
2. Include detailed reproduction steps
3. Provide environment information
4. Add screenshots if applicable
5. Include error messages/logs

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.0.0]
```

## 💡 Feature Requests

### Suggesting Features
1. Check if feature already exists or is planned
2. Use the feature request template
3. Provide clear use case and benefits
4. Include mockups or examples if helpful

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context or screenshots
```

## 🎯 Priority Areas

We're particularly interested in contributions to:

1. **AI Integration**
   - New tutor personas
   - Enhanced prompt engineering
   - Better error handling

2. **User Experience**
   - Accessibility improvements
   - Mobile responsiveness
   - Performance optimizations

3. **Educational Content**
   - Subject-specific features
   - Assessment tools
   - Progress tracking

4. **Developer Experience**
   - Testing infrastructure
   - Documentation
   - CI/CD improvements

## 📚 Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/)

### Project Dependencies
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Google Gemini AI](https://ai.google.dev/)

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

### Getting Help
- Check existing documentation
- Search closed issues
- Ask in discussions
- Be specific about problems

## 🏆 Recognition

Contributors will be:
- Listed in our contributors section
- Mentioned in release notes
- Eligible for maintainer status
- Invited to community events

Thank you for helping make EduTutor better for everyone! 🎓