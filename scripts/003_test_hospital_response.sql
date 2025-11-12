-- This script simulates a hospital responding to an SOS alert
-- Run this after creating an SOS alert to see the hospital name displayed

-- First, let's check if we have any active SOS alerts
DO $$
DECLARE
  latest_alert_id UUID;
  first_hospital_id UUID;
BEGIN
  -- Get the most recent SOS alert
  SELECT id INTO latest_alert_id
  FROM sos_alerts
  ORDER BY created_at DESC
  LIMIT 1;

  -- Get the first hospital
  SELECT id INTO first_hospital_id
  FROM hospitals
  LIMIT 1;

  -- If both exist, create a hospital response
  IF latest_alert_id IS NOT NULL AND first_hospital_id IS NOT NULL THEN
    -- Insert hospital response
    INSERT INTO hospital_responses (alert_id, hospital_id, status, eta, ambulance_latitude, ambulance_longitude)
    VALUES (
      latest_alert_id,
      first_hospital_id,
      'dispatched',
      8,
      -- Use the alert's location as starting point for ambulance
      (SELECT latitude FROM sos_alerts WHERE id = latest_alert_id),
      (SELECT longitude FROM sos_alerts WHERE id = latest_alert_id)
    )
    ON CONFLICT (alert_id, hospital_id) DO UPDATE
    SET status = EXCLUDED.status,
        eta = EXCLUDED.eta,
        updated_at = NOW();

    -- Update the SOS alert status
    UPDATE sos_alerts
    SET status = 'accepted'
    WHERE id = latest_alert_id;

    RAISE NOTICE 'Hospital response created for alert %', latest_alert_id;
  ELSE
    RAISE NOTICE 'No active SOS alert or hospital found. Please create an SOS alert first.';
  END IF;
END $$;
