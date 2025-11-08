/**
 * Demo Application
 * 
 * Showcases all UI components from Task 9
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetProvider, Widget } from './index';

function DemoApp() {
  const [count, setCount] = React.useState(0);

  return (
    <WidgetProvider>
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px' }}>
          Molecool Widget SDK - Component Demo
        </h1>

        {/* Container Demo */}
        <Widget.Container>
          <Widget.Header>Typography Components</Widget.Header>
          <Widget.Title size="large">Large Title</Widget.Title>
          <Widget.Title size="medium">Medium Title (Default)</Widget.Title>
          <Widget.Title size="small">Small Title</Widget.Title>
          <Widget.Divider />
          <Widget.LargeText>42°C</Widget.LargeText>
          <Widget.SmallText>Current temperature</Widget.SmallText>
        </Widget.Container>

        {/* Button Demo */}
        <Widget.Container>
          <Widget.Header>Button Components</Widget.Header>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Widget.Button variant="primary" onClick={() => setCount(count + 1)}>
              Primary Button
            </Widget.Button>
            <Widget.Button variant="secondary" onClick={() => setCount(count - 1)}>
              Secondary Button
            </Widget.Button>
            <Widget.Button variant="danger" onClick={() => setCount(0)}>
              Danger Button
            </Widget.Button>
            <Widget.Button disabled>
              Disabled Button
            </Widget.Button>
          </div>
          <Widget.Divider />
          <Widget.SmallText>Click count: {count}</Widget.SmallText>
        </Widget.Container>

        {/* Grid Demo */}
        <Widget.Container>
          <Widget.Header>Grid Layout</Widget.Header>
          <Widget.Grid columns={2} gap={12}>
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Widget.SmallText>Grid Item 1</Widget.SmallText>
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Widget.SmallText>Grid Item 2</Widget.SmallText>
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Widget.SmallText>Grid Item 3</Widget.SmallText>
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Widget.SmallText>Grid Item 4</Widget.SmallText>
            </div>
          </Widget.Grid>
        </Widget.Container>

        {/* Combined Demo */}
        <Widget.Container>
          <Widget.Header>Clock Widget Example</Widget.Header>
          <Widget.LargeText>
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Widget.LargeText>
          <Widget.SmallText>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Widget.SmallText>
        </Widget.Container>
      </div>
    </WidgetProvider>
  );
}

// Mount the demo app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<DemoApp />);
}
