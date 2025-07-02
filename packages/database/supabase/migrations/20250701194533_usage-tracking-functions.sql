-- Function to safely increment user count
CREATE OR REPLACE FUNCTION increment_users(company_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT users INTO current_count
  FROM "companyUsage"
  WHERE "companyId" = company_id;
  
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  RETURN current_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to safely increment task count
CREATE OR REPLACE FUNCTION increment_tasks(company_id TEXT, count INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT tasks INTO current_count
  FROM "companyUsage"
  WHERE "companyId" = company_id;
  
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  RETURN current_count + count;
END;
$$ LANGUAGE plpgsql;

-- Function to safely increment AI token count
CREATE OR REPLACE FUNCTION increment_ai_tokens(company_id TEXT, count INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT "aiTokens" INTO current_count
  FROM "companyUsage"
  WHERE "companyId" = company_id;
  
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  RETURN current_count + count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a company has exceeded their plan limits
CREATE OR REPLACE FUNCTION check_usage_limits(company_id TEXT)
RETURNS TABLE(
  users_exceeded BOOLEAN,
  tasks_exceeded BOOLEAN,
  ai_tokens_exceeded BOOLEAN,
  users_left INTEGER,
  tasks_left INTEGER,
  ai_tokens_left INTEGER
) AS $$
DECLARE
  plan_record RECORD;
  usage_record RECORD;
BEGIN
  -- Get company plan
  SELECT cp.* INTO plan_record
  FROM "companyPlan" cp
  WHERE cp."companyId" = company_id;
  
  -- Get company usage
  SELECT cu.* INTO usage_record
  FROM "companyUsage" cu
  WHERE cu."companyId" = company_id;
  
  -- If no plan or usage found, return all limits exceeded
  IF plan_record IS NULL OR usage_record IS NULL THEN
    RETURN QUERY SELECT TRUE, TRUE, TRUE, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate limits and remaining usage
  RETURN QUERY SELECT
    (usage_record.users >= plan_record."includedUsers"),
    (usage_record.tasks >= plan_record."tasksLimit"),
    (usage_record."aiTokens" >= plan_record."aiTokensLimit"),
    GREATEST(0, plan_record."includedUsers" - usage_record.users),
    GREATEST(0, plan_record."tasksLimit" - usage_record.tasks),
    GREATEST(0, plan_record."aiTokensLimit" - usage_record."aiTokens");
END;
$$ LANGUAGE plpgsql;