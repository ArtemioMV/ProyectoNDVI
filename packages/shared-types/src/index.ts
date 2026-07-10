export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };

export type UserRole =
  | "ADMINISTRADOR"
  | "SECRETARIA_CAJA"
  | "TECNICO"
  | "INVENTARIO_VENTAS";
