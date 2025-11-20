# Sample Files

Place your PDF files in this directory for conversion.

## Sample File Types

### BOQ (Bill of Quantities)
Place BOQ PDFs here with filenames like:
- `smoke_detector_boq.pdf`
- `fire_alarm_bill.pdf`
- `project_quantities.pdf`

### Specification Sheets
Place spec sheet PDFs here with filenames like:
- `detector_spec.pdf`
- `control_panel_specs.pdf`
- `equipment_specifications.pdf`

## Example Content Structure

### BOQ PDF Should Contain:
- Item numbers (1, 2, 3 or 1.1, 1.2, etc.)
- Product descriptions
- Quantities
- Units (NOS, EA, M, FT, etc.)

Example:
```
1  Photoelectric Smoke Detector, 24VDC  50
2  Addressable Heat Detector  25
3  Manual Pull Station, Red  10
```

### Spec Sheet PDF Should Contain:
- Product model numbers
- Technical specifications (voltage, current, dimensions)
- Compliance standards (UL, NFPA, FM)
- Features and descriptions

## Notes

- PDFs must contain actual text (not scanned images without OCR)
- Tables in PDFs will be extracted and converted
- The converter will attempt to auto-detect document type
- You can specify document type explicitly using the `-t` flag
