#! bin/bash
echo -e "\033[31m Please make sure your key to fill in the following \033[0m"
DINGTALK_CORP_ID='YOUR_DINGTALK_CORP_ID' \
DINGTALK_CORP_SECRET='YOUR_DINGTALK_CORP_SECRET' \
npm run test-cov;
