import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'

export function IsNotBeforeStart(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeStart',
      target: object.constructor,
      propertyName,
      options: { message: 'endDate must not be before startDate', ...validationOptions },
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const dto = args.object as GetTicketsQueryDto
          if (!dto.startDate || !dto.endDate) return true
          return new Date(dto.endDate) >= new Date(dto.startDate)
        },
      },
    });
  };
}

export class GetTicketsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by site IDs - comma-separated or repeated param (?siteIds=1,5 or ?siteIds=1&siteIds=5)',
    example: '1,5,42',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    const raw = Array.isArray(value) ? value.join(',') : value
    if (!raw?.trim()) return []
    return raw
      .split(',')
      .map((val) => parseInt(val.trim(), 10))
      .filter((n) => !isNaN(n))
  })
  @IsArray()
  @IsNumber({}, { each: true })
  siteIds?: number[]

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start of date range (inclusive)' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'End of date range (inclusive, through 23:59:59 UTC)',
  })
  @IsNotBeforeStart()
  @ValidateIf((o: GetTicketsQueryDto) => !!o.startDate && !!o.endDate)
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50
}
