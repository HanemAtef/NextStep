import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ar from 'date-fns/locale/ar';

// تسجيل اللغة العربية لمكون تحديد التاريخ
registerLocale('ar', ar);
setDefaultLocale('ar');

function DateRangePicker({ dateRange, onChange }) {
    const handleStartDateChange = (date) => {
        onChange({
            ...dateRange,
            startDate: date
        });
    };

    const handleEndDateChange = (date) => {
        onChange({
            ...dateRange,
            endDate: date
        });
    };

    // تعيين فترة زمنية مسبقة
    const setPresetRange = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        onChange({ startDate, endDate });
    };

    return (
        <Form>
            <Row className="align-items-center">
                <Col md={2}>
                    <Form.Group>
                        <Form.Label>من تاريخ</Form.Label>
                        <DatePicker
                            selected={dateRange.startDate}
                            onChange={handleStartDateChange}
                            selectsStart
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            className="form-control"
                            dateFormat="dd/MM/yyyy"
                            locale="ar"
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group>
                        <Form.Label>إلى تاريخ</Form.Label>
                        <DatePicker
                            selected={dateRange.endDate}
                            onChange={handleEndDateChange}
                            selectsEnd
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            minDate={dateRange.startDate}
                            className="form-control"
                            dateFormat="dd/MM/yyyy"
                            locale="ar"
                        />
                    </Form.Group>
                </Col>
                <Col md={6} className="d-flex gap-2 align-items-end">
                    <Button variant="outline-secondary" size="sm" onClick={() => setPresetRange(7)}>
                        آخر أسبوع
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setPresetRange(30)}>
                        آخر شهر
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setPresetRange(90)}>
                        آخر 3 أشهر
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setPresetRange(365)}>
                        آخر سنة
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default DateRangePicker; 