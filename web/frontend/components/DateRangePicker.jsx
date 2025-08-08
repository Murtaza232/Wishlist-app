import React, { useState, useEffect } from 'react';
import { Popover, Button, Text, InlineStack, Box, Divider } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';
import { useLanguage } from './providers';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  onRangeSelect, 
  activator, 
  open, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [currentStartDate, setCurrentStartDate] = useState(startDate || new Date());
  const [currentEndDate, setCurrentEndDate] = useState(endDate || new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(startDate || new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(endDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to determine which predefined range matches the current selection
  const getCurrentRangeValue = () => {
    if (!selectedStartDate || !selectedEndDate) return null;
    
    const today = new Date();
    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Check if it's today
    if (startDate.getTime() === today.getTime() && endDate.getTime() === today.getTime()) {
      return 'today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (startDate.getTime() === yesterday.getTime() && endDate.getTime() === yesterday.getTime()) {
      return 'yesterday';
    }
    
    // Check if it's last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    if (startDate.getTime() === sevenDaysAgo.getTime() && endDate.getTime() === today.getTime()) {
      return 'last7days';
    }
    
    // Check if it's last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    if (startDate.getTime() === thirtyDaysAgo.getTime() && endDate.getTime() === today.getTime()) {
      return 'last30days';
    }
    
    // Check if it's this month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (startDate.getTime() === thisMonthStart.getTime() && endDate.getTime() === thisMonthEnd.getTime()) {
      return 'thisMonth';
    }
    
    // Check if it's last month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    if (startDate.getTime() === lastMonthStart.getTime() && endDate.getTime() === lastMonthEnd.getTime()) {
      return 'lastMonth';
    }
    
    return null; // Custom range
  };

  const currentRangeValue = getCurrentRangeValue();

  const predefinedRanges = [
    { label: t('Today', 'Dashboard'), value: 'today', selected: currentRangeValue === 'today' },
    { label: t('Yesterday', 'Dashboard'), value: 'yesterday', selected: currentRangeValue === 'yesterday' },
    { label: t('Last 7 Days', 'Dashboard'), value: 'last7days', selected: currentRangeValue === 'last7days' },
    { label: t('Last 30 Days', 'Dashboard'), value: 'last30days', selected: currentRangeValue === 'last30days' },
    { label: t('This Month', 'Dashboard'), value: 'thisMonth', selected: currentRangeValue === 'thisMonth' },
    { label: t('Last Month', 'Dashboard'), value: 'lastMonth', selected: currentRangeValue === 'lastMonth' }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    return (
      (selectedStartDate && formatDate(date) === formatDate(selectedStartDate)) ||
      (selectedEndDate && formatDate(date) === formatDate(selectedEndDate))
    );
  };

  const handleDateClick = (date) => {
    if (!date) return;
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const handleRangeSelect = (rangeValue) => {
    const today = new Date();
    let start, end;
    
    switch (rangeValue) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    setCurrentStartDate(start);
    setCurrentEndDate(end);
    
    if (onRangeSelect) {
      onRangeSelect({ start, end, range: rangeValue });
    }
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      setCurrentStartDate(selectedStartDate);
      setCurrentEndDate(selectedEndDate);
      
      if (onDateChange) {
        onDateChange({ start: selectedStartDate, end: selectedEndDate });
      }
      
      if (onClose) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    setSelectedStartDate(currentStartDate);
    setSelectedEndDate(currentEndDate);
    if (onClose) {
      onClose();
    }
  };

  const navigateMonth = (direction, isNextMonth = false) => {
    const targetMonth = isNextMonth ? nextMonth : currentMonth;
    const newMonth = new Date(targetMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    
    if (isNextMonth) {
      setNextMonth(newMonth);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const renderCalendar = (date, isNextMonth = false) => {
    const days = getDaysInMonth(date);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return (
      <div 
        className={isMobile ? 'calendar' : ''}
        style={{ minWidth: isMobile ? '280px' : '240px' }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <button
            onClick={() => navigateMonth(-1, isNextMonth)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666'
            }}
          >
            ←
          </button>
          <Text variant="headingMd" fontWeight="semibold">
            {monthName}
          </Text>
          <button
            onClick={() => navigateMonth(1, isNextMonth)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666'
            }}
          >
            →
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ 
              padding: '6px', 
              textAlign: 'center', 
              fontSize: '11px',
              color: '#666',
              fontWeight: '500'
            }}>
              {day}
            </div>
          ))}
          
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              style={{
                padding: '6px',
                textAlign: 'center',
                cursor: day ? 'pointer' : 'default',
                borderRadius: '3px',
                fontSize: '13px',
                backgroundColor: day ? (
                  isDateSelected(day) ? '#202223' : 
                  isDateInRange(day) ? '#f6f6f7' : 'transparent'
                ) : 'transparent',
                color: day ? (
                  isDateSelected(day) ? 'white' : '#202223'
                ) : 'transparent',
                fontWeight: isDateSelected(day) ? 'bold' : 'normal',
                minHeight: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {day ? day.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Popover
      active={open}
      activator={activator}
      onClose={onClose}
      preferredPosition="below"
      preferredAlignment="left"
    >
      <div 
        className={isMobile ? 'date-picker-mobile' : ''}
        style={{ 
          display: 'flex', 
          width: isMobile ? '350px' : '700px',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row'
        }}
      >
        <style>
          {`
                      /* Override Popover width constraints */
            .Polaris-Popover {
              max-width: none !important;
              width: auto !important;
            }
            
            .Polaris-Popover__Content {
              max-width: none !important;
              width: auto !important;
              min-width: 700px !important;
            }
            
            .Polaris-Popover__Pane {
              max-width: none !important;
              width: auto !important;
            }
            
            /* Ensure the popover container doesn't restrict width */
            .Polaris-Popover__Container {
              max-width: none !important;
              width: auto !important;
            }
            
            /* Override any other width constraints */
            .Polaris-Popover__Content > div {
              max-width: none !important;
              width: auto !important;
            }
            
            /* Add margin from right */
            .Polaris-Popover {
              margin-right: 30px !important;
            }
            
            .Polaris-Popover__Content {
              margin-right: 30px !important;
            }
            
            /* Ensure the popover doesn't get cut off on the right */
            .Polaris-Popover__Container {
              margin-right: 30px !important;
              right: 20px !important;
          }
            /* Override Popover width constraints only for small screens (720px or less) */
            @media (max-width: 720px) {
              .Polaris-Popover {
                max-width: none !important;
                width: auto !important;
                margin-right: 30px !important;
              }
              
              .Polaris-Popover__Content {
                max-width: none !important;
                width: auto !important;
                min-width: 350px !important;
                max-width: 400px !important;
                margin-right: 30px !important;
              }
              
              .Polaris-Popover__Pane {
                max-width: none !important;
                width: auto !important;
              }
              
              /* Ensure the popover container doesn't restrict width */
              .Polaris-Popover__Container {
                max-width: none !important;
                width: auto !important;
                margin-right: 30px !important;
                right: 20px !important;
              }
              
              /* Override any other width constraints */
              .Polaris-Popover__Content > div {
                max-width: none !important;
                width: auto !important;
              }
              
              /* Mobile layout styles */
              .date-picker-mobile {
                flex-direction: column !important;
                width: 350px !important;
                max-width: 400px !important;
              }
              
              .date-picker-mobile .sidebar {
                width: 100% !important;
                border-right: none !important;
                border-bottom: 1px solid #e1e3e5 !important;
                padding: 12px !important;
              }
              
              .date-picker-mobile .main-content {
                padding: 12px !important;
              }
              
              .date-picker-mobile .calendar-container {
                justify-content: center !important;
                gap: 0 !important;
              }
              
              .date-picker-mobile .calendar {
                min-width: 280px !important;
              }
            }
          `}
        </style>
        {/* Left Sidebar - Predefined Ranges */}
        <div 
          className={isMobile ? 'sidebar' : ''}
          style={{ 
            width: isMobile ? '100%' : '200px', 
            backgroundColor: '#f6f6f7',
            padding: '12px',
            borderRight: isMobile ? 'none' : '1px solid #e1e3e5',
            borderBottom: isMobile ? '1px solid #e1e3e5' : 'none'
          }}
        >
          <Text variant="headingSm" fontWeight="semibold" style={{ marginBottom: '12px' }}>
            {t('Quick Select','Dashboard')}
          </Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {predefinedRanges.map((range) => (
              <div
                key={range.value}
                onClick={() => handleRangeSelect(range.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: range.selected ? '#e1e3e5' : 'transparent',
                  color: range.selected ? '#202223' : '#6d7175',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s ease',
                  minHeight: '28px'
                }}
              >
                {range.label}
                {range.selected && (
                  <span style={{ fontSize: '16px' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Calendars and Date Inputs */}
        <div 
          className={isMobile ? 'main-content' : ''}
          style={{ flex: 1, padding: '12px' }}
        >
          {/* Date Inputs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <Text variant="bodySm" color="subdued" style={{ marginBottom: '4px' }}>
                {t('Start Date','Dashboard')}
              </Text>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #c9cccf',
                borderRadius: '4px',
                padding: '6px 10px',
                backgroundColor: 'white',
                minHeight: '36px'
              }}>
                <CalendarIcon style={{ width: '14px', height: '14px', color: '#6d7175', marginRight: '6px' }} />
                <input
                  type="date"
                  value={selectedStartDate ? formatDate(selectedStartDate) : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setSelectedStartDate(date);
                  }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#202223',
                    backgroundColor: 'transparent',
                    width: '100%'
                  }}
                />
              </div>
            </div>
            
            <div style={{ color: '#6d7175', fontSize: '16px' }}>→</div>
            
            <div style={{ flex: 1 }}>
              <Text variant="bodySm" color="subdued" style={{ marginBottom: '4px' }}>
                {t('End Date','Dashboard')}
              </Text>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #c9cccf',
                borderRadius: '4px',
                padding: '6px 10px',
                backgroundColor: 'white',
                minHeight: '36px'
              }}>
                <CalendarIcon style={{ width: '14px', height: '14px', color: '#6d7175', marginRight: '6px' }} />
                <input
                  type="date"
                  value={selectedEndDate ? formatDate(selectedEndDate) : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setSelectedEndDate(date);
                  }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#202223',
                    backgroundColor: 'transparent',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Calendars */}
          <div 
            className={isMobile ? 'calendar-container' : ''}
            style={{ 
              display: 'flex', 
              gap: isMobile ? '0' : '20px',
              marginBottom: '16px',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}
          >
            {renderCalendar(currentMonth)}
            {!isMobile && renderCalendar(nextMonth, true)}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            borderTop: '1px solid #e1e3e5',
            paddingTop: '12px'
          }}>
            <Button variant="tertiary" onClick={handleCancel}>
              {t('Cancel','Dashboard')}
            </Button>
            <Button variant="primary" onClick={handleApply}>
              {t('Apply','Dashboard')}
            </Button>
          </div>
        </div>
      </div>
    </Popover>
  );
};

export default DateRangePicker; 