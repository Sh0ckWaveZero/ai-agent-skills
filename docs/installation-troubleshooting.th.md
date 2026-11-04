# แก้ปัญหาติดตั้งสกิล

ถ้า `npx skills add` แจ้ง `EACCES`, `permission denied` หรือ access denied ให้ดู path ในข้อความผิดพลาดก่อน ตัวติดตั้งอาจไม่มีสิทธิ์แทนที่ไฟล์สกิลเดิม และรายการที่ล้มเหลวหลาย agent อาจชี้มาที่ไฟล์เดียวกัน

ตรวจเจ้าของและสิทธิ์ของ **โฟลเดอร์ที่เก็บไฟล์** รวมถึงตัวไฟล์ บนเครื่องและบัญชีที่ติดตั้งไม่ผ่าน ตัวอย่างใช้ `design-system-ai-agent` ให้เปลี่ยนเป็นชื่อสกิลและ path ที่ปรากฏใน error หาก path เป็นขององค์กรหรือ symlink ชี้ออกไปนอกพื้นที่ส่วนตัว ให้ผู้ดูแลเครื่องช่วยตรวจสอบ

## macOS และ Linux

เปิด Terminal แล้วตรวจบัญชีและโฟลเดอร์สกิล:

```sh
whoami
ls -ld "$HOME/.agents" "$HOME/.agents/skills" "$HOME/.agents/skills/design-system-ai-agent"
ls -l "$HOME/.agents/skills/design-system-ai-agent/SKILL.md"
```

บน macOS ใช้ `ls -ldeO` กับ path เหล่านี้เพื่อตรวจ ACL และ flags เพิ่มเติม ส่วน Linux ใช้ `getfacl <path>` หากมี ตรวจปลายทางของ symlink ก่อนเปลี่ยนสิทธิ์ เพราะอาจชี้ออกไปนอกโฟลเดอร์สกิล

ถ้าตรวจพบว่าโฟลเดอร์สกิลส่วนตัวเป็นของ `root` เพราะเคยติดตั้งด้วย `sudo` ให้ตรวจ path และไฟล์ภายในก่อน แล้วเปลี่ยนเจ้าของเฉพาะโฟลเดอร์นั้น:

```sh
sudo chown -R "$(id -un)":"$(id -gn)" "$HOME/.agents/skills/design-system-ai-agent"
```

ถ้าปัญหาอยู่ที่โฟลเดอร์แม่, ACL, flags, filesystem แบบอ่านอย่างเดียว หรือนโยบายองค์กร ให้แก้ตามสาเหตุหรือปรึกษาผู้ดูแลเครื่อง อย่าเปลี่ยนเจ้าของทั้ง home หรือ `.agents` แบบ recursive และอย่าใช้ `sudo` รันตัวติดตั้งเพื่อเลี่ยงปัญหา

## Windows

เปิด PowerShell แล้วตรวจบัญชีและ path ที่มีปัญหา:

```powershell
whoami
$skillDir = Join-Path $HOME '.agents\skills\design-system-ai-agent'
Get-Item -Force $skillDir, (Join-Path $skillDir 'SKILL.md') | Format-List FullName, Attributes, LinkType, Target
Get-Acl $skillDir | Format-List Owner, Access
icacls $skillDir
```

ใช้ `Get-Acl` ตรวจโฟลเดอร์แม่ด้วย หากเป็น path ขององค์กรหรือเป็น link ไปที่อื่น ให้ผู้ดูแลเครื่องช่วยตรวจสิทธิ์ หากเป็นโฟลเดอร์ส่วนตัว ให้ดูเจ้าของและสิทธิ์ใน **Properties → Security → Advanced** ก่อนแก้เฉพาะโฟลเดอร์ที่มีปัญหา ไม่ต้อง reset สิทธิ์ทั้งโปรไฟล์หรือเปิดตัวติดตั้งแบบ Administrator เป็นประจำ

## ลองติดตั้งอีกครั้ง

หลังแก้สาเหตุที่ตรวจพบแล้ว ให้รันคำสั่งเดิมด้วยบัญชีผู้ใช้ปกติ:

```sh
npx skills add https://github.com/Sh0ckWaveZero/ai-agent-skills.git
```

ถ้ายังไม่ผ่าน ให้เก็บข้อความ error, path, เจ้าของ, สิทธิ์ และระบบปฏิบัติการไว้ตรวจต่อ ตรวจข้อมูลส่วนตัวใน path หรือ log ก่อนแชร์ เมื่อติดตั้งสำเร็จแล้วให้เริ่มเซสชัน agent ใหม่
