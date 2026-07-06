# Migración compatible CashLife

No se renombra la colección `people`. La aplicación la muestra como Contactos y admite campos legacy (`tipo`, `tipoDeuda`, `deuda`) junto con los nuevos campos (`contactType`, `roles`, `notes`, `active`).

Para pagos programados se agrega historial mensual bajo:

`users/{uid}/scheduledPayments/{paymentId}/periods/{yyyyMM}`

La migración es perezosa/idempotente: al marcar un periodo como pagado se crea o actualiza el documento del periodo y se genera el siguiente periodo pendiente si no existe.
