# Contributing to EduTutor

Thank you for considering contributing to EduTutor! We welcome contributions from everyone.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/edututor.git
   cd edututor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared types and schemas
- `components.json` - Shadcn/ui configuration

## Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (Prettier/ESLint configs)
- Use meaningful variable and function names
- Add comments for complex logic

## Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run dev
   # Test manually in the browser
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide a clear description of your changes
   - Include screenshots for UI changes
   - Reference any related issues

## Types of Contributions

### Bug Fixes
- Fix broken functionality
- Improve error handling
- Performance optimizations

### Features
- New AI tutor personas
- Additional practice paper types
- UI/UX improvements
- Integration with other APIs

### Documentation
- Improve README
- Add code comments
- Update API documentation

## Guidelines

### Pull Requests
- Keep PRs focused and small
- Write clear commit messages
- Update tests when needed
- Ensure all checks pass

### Issues
- Use issue templates when available
- Provide clear reproduction steps for bugs
- Include screenshots for UI issues

### Code Reviews
- Be respectful and constructive
- Ask questions if something is unclear
- Suggest alternatives when appropriate

## Getting Help

- Check existing issues and discussions
- Ask questions in issue comments
- Join our community discussions

## License

By contributing to EduTutor, you agree that your contributions will be licensed under the MIT License.