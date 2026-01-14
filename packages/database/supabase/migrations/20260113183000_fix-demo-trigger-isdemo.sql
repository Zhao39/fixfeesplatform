-- Update the trigger to inherit isDemo status from the item and set Active status for demos
CREATE OR REPLACE FUNCTION public.create_make_method_related_records()
RETURNS TRIGGER AS $$
BEGIN
  IF new.type IN ('Part', 'Tool') THEN
    INSERT INTO public."makeMethod"("itemId", "createdBy", "companyId", "isDemo", "status")
    VALUES (
      new.id,
      new."createdBy",
      new."companyId",
      COALESCE(new."isDemo", FALSE),
      CASE WHEN COALESCE(new."isDemo", FALSE) THEN 'Active'::"makeMethodStatus" ELSE 'Draft'::"makeMethodStatus" END
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
