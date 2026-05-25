# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# typescript
- For TypeORM entities, disable strictPropertyInitialization in tsconfig instead of using `!` definite assignment assertions on properties. Confidence: 0.65

# workflow
- Plan before implementing code changes — write a plan first, get approval, then implement. Confidence: 0.70

# nestjs
- Use PATCH (not PUT) for update endpoints. Confidence: 0.65
- For update DTOs, extend PartialType of the create DTO rather than redeclare all fields individually. Confidence: 0.65
- Use dedicated param DTOs for create operations in services, not plain objects — even when the service method is only called internally by other modules. Confidence: 0.65
