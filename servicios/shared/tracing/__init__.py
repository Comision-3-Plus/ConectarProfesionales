"""Módulo de tracing distribuido con OpenTelemetry"""
from .opentelemetry import (
    setup_tracing,
    get_tracer,
    add_span_attributes,
    add_span_event,
    record_exception,
    traced,
    get_trace_context_headers,
    TracingHelper,
    tracing_helper
)

__all__ = [
    "setup_tracing",
    "get_tracer",
    "add_span_attributes",
    "add_span_event",
    "record_exception",
    "traced",
    "get_trace_context_headers",
    "TracingHelper",
    "tracing_helper"
]
