import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateExpenseCategoryDto } from "./dto/create-expense-category.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";

@ApiTags("gastos")
@Controller("gastos")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: "Listar gastos" })
  findExpenses(@Query("period") period?: string) {
    return this.expensesService.findExpenses(period);
  }

  @Post()
  @ApiOperation({ summary: "Registrar gasto operativo" })
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Get("categorias")
  @ApiOperation({ summary: "Listar categorias de gasto" })
  findCategories() {
    return this.expensesService.findCategories();
  }

  @Patch(":id/anular")
  @ApiOperation({ summary: "Anular gasto: devuelve efectivo a caja si aplica" })
  void(@Param("id") id: string) {
    return this.expensesService.voidExpense(id);
  }

  @Post("categorias")
  @ApiOperation({ summary: "Crear categoria de gasto" })
  createCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.expensesService.createCategory(dto);
  }
}
