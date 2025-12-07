/*
  # Cost Analytics & Budget Management System

  This migration sets up the database schema for:
  1. Cost Shadow Simulation (tracking actual vs hidden costs)
  2. AI Cost Consultant (storing recommendations)
  3. Team Budget & Chargeback (budget tracking by team/feature)

  ## Tables Created
  - organizations: Team/company accounts
  - budgets: Budget allocation per organization
  - api_calls: Track all API calls with costs
  - cost_analytics: Simulation data (errors, retries, network)
  - recommendations: AI-generated cost optimization suggestions
  - feature_tags: Tag API calls to features for cost allocation
*/

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are viewable by authenticated users"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  allocated_amount decimal(12, 2) NOT NULL,
  spent_amount decimal(12, 2) DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  alert_threshold integer DEFAULT 80,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS api_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  cost decimal(10, 6) NOT NULL,
  success boolean DEFAULT true,
  retry_count integer DEFAULT 0,
  network_cost decimal(10, 6) DEFAULT 0,
  latency_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org api calls"
  ON api_calls FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS cost_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  api_call_id uuid REFERENCES api_calls(id) ON DELETE CASCADE,
  direct_cost decimal(10, 6) NOT NULL,
  error_rate_percent decimal(5, 2) DEFAULT 0,
  estimated_retry_cost decimal(10, 6) DEFAULT 0,
  egress_cost decimal(10, 6) DEFAULT 0,
  cache_miss_cost decimal(10, 6) DEFAULT 0,
  total_shadow_cost decimal(10, 6) NOT NULL,
  scenario text CHECK (scenario IN ('normal', 'peak', 'failure', 'degraded')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cost_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org analytics"
  ON cost_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  estimated_savings decimal(10, 6) NOT NULL,
  implementation_difficulty text CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL,
  code_suggestion text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'implemented', 'rejected')),
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS feature_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  api_call_id uuid REFERENCES api_calls(id) ON DELETE CASCADE NOT NULL,
  tag_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feature_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view feature tags"
  ON feature_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS team_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  team_name text NOT NULL,
  monthly_budget decimal(12, 2) NOT NULL,
  spent_amount decimal(12, 2) DEFAULT 0,
  month date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team allocations"
  ON team_allocations FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_api_calls_org ON api_calls(org_id);
CREATE INDEX idx_api_calls_created ON api_calls(created_at);
CREATE INDEX idx_cost_analytics_org ON cost_analytics(org_id);
CREATE INDEX idx_recommendations_org ON recommendations(org_id);
CREATE INDEX idx_feature_tags_org ON feature_tags(org_id);
CREATE INDEX idx_budgets_org ON budgets(org_id);